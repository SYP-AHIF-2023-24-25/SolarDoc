import { inject, lifeCycleObserver, LifeCycleObserver } from '@loopback/core'
import { juggler } from '@loopback/repository'
import { ensureEnvLoaded, getEnv, isDev } from '../env'
import { createClient as createV4Client, RedisClientType } from 'redis'
import { DataSourceError } from '../errors'
import { RedisError } from '../errors/redis-error'

// Ensure all env files have been loaded (only relevant for development mode)
ensureEnvLoaded()

const config = {
  name: 'redisdb',
  connector: 'loopback-connector-redis',
  host: getEnv(isDev ? 'REDIS_DEV_HOST' : 'REDIS_HOST'),
  port: Number(getEnv(isDev ? 'REDIS_DEV_PORT' : 'REDIS_PORT')),
  password: getEnv('REDIS_ROOT_PASSWORD'),
}

const v4Config = (() => {
  const baseConfig = {
    host: config.host,
    port: config.port,
    username: getEnv('REDIS_USERNAME'),
    password: getEnv('REDIS_PASSWORD'),
  }
  return {
    ...baseConfig,
    url: `redis://${baseConfig.host}:${baseConfig.port}`,
  }
})()

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class RedisDBDataSource extends juggler.DataSource implements LifeCycleObserver {
  static dataSourceName = 'redisdb'
  static readonly defaultConfig = config

  /**
   * The *modern* Redis Client which exposes a far more modern API than the default one.
   *
   * This is terrible, as we are basically maintaining two connections to the same database, but it's the only way
   * to get the modern API. (The default one from `loopback-connector-redis` is only at version 2.8.0, which is
   * very outdated (2017), but seems to still work on the most basic level i.e. creating hash maps, maintaining keys,
   * updating values and fetching values.)
   * @since 0.2.0
   */
  public readonly v4Client: RedisClientType & ReturnType<typeof createV4Client>

  static readonly v4DefaultConfig = v4Config

  constructor(
    @inject('datasources.config.redisdb', { optional: true })
    dsConfig: object = config,
  ) {
    super(dsConfig)
    this.v4Client = <RedisClientType>createV4Client(RedisDBDataSource.v4DefaultConfig)

    // Ensure that the connector is defined
    if (this.connector === undefined) {
      throw new DataSourceError("Required 'connector' property is missing from the data source.")
    }
  }

  /**
   * The URL of the database. Does not include the password or username.
   *
   * Only the host and port are included.
   * @since 0.2.0
   */
  public get sanitisedUrl(): string {
    return `redis://${RedisDBDataSource.v4DefaultConfig.host}:${RedisDBDataSource.v4DefaultConfig.port}`
  }

  /**
   * Connects the v4 client to the database.
   * @private
   */
  private async connectV4Client(): Promise<void> {
    try {
      await this.v4Client.connect()
    } catch (e) {
      throw new DataSourceError(
        `Failed to connect to Redis v4 database at "${this.sanitisedUrl}":\n > ${e}`,
      )
    }
    console.log(`[REDISv4] Connected to Redis v4 database at ${this.sanitisedUrl}`)

    await this.logDBDiagnostics()
  }

  /**
   * Log all (important) diagnostic data from the database.
   * @private
   */
  private async logDBDiagnostics(): Promise<void> {
    const dbServerInfo = await this.v4Client.info('server')
    const dbErrorInfo = await this.v4Client.info('errorstats')
    console.log(`[REDISv4] Database info:\n${dbServerInfo}`)
    console.log(`[REDISv4] Database error info:\n${dbErrorInfo}`)
  }

  /**
   * Initialise the data source. This in this case only prepares the v4 client, as the default client is initialised
   * by the {@link Connector} class.
   * @since 0.2.0
   */
  public async init(): Promise<void> {
    await this.connectV4Client()
  }

  /**
   * Disconnects and stops the data source.
   * @since 0.2.0
   */
  public override async stop(): Promise<void> {
    await this.v4Client.quit()
    await super.stop()
  }

  /**
   * Sets the value for the given key and subkey. This performs a raw Redis HSET operation.
   * @param key The key to set the value for.
   * @param subkey The subkey to set the value for.
   * @param value The value to set.
   */
  public async hset(key: string, subkey: string, value: string): Promise<boolean> {
    const status = await this.v4Client.HSET(key, subkey, value)
    if (status !== 1) {
      throw new RedisError(`Could not set value for key '${key}' and subkey '${subkey}'`)
    }
    return true
  }
}
