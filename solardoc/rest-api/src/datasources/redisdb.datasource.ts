import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler, Options} from '@loopback/repository';
import {ensureEnvLoaded, getEnv} from "../services";

ensureEnvLoaded()
const config = {
  name: 'redisdb',
  connector: 'loopback-connector-redis',
  host: getEnv("REDIS_HOST"),
  port: Number(getEnv("REDIS_PORT")),
  password: getEnv("REDIS_ROOT_PASSWORD"),
}

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class RedisDBDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'redisdb';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.redisdb', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
