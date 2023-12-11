import { BindingScope, injectable } from '@loopback/core'
import { repository } from '@loopback/repository'
import { CacheRepository, UUIDV4 } from '../repositories'
import { CachedElement } from '../models'
import { DataObject } from '@loopback/repository/src/common-types'
import { getEnv } from '../env'
import * as fs from 'fs/promises'
import * as path from 'path'
import { checkFileExtensionForMimeType, getDateNowInSeconds, getFileExtension } from '../utils'
import { CacheError } from '../errors'
import { CacheRedisKeyNotFoundError } from '../errors/cache-redis-key-not-found-error'
import { CacheStoredFileNotFound } from '../errors/cache-stored-file-not-found'
import { RedisDBDataSource } from '../datasources'

@injectable({ scope: BindingScope.TRANSIENT })
export class CacheService {
  private readonly persistentStoragePath: string

  constructor(@repository(CacheRepository) public cache: CacheRepository) {
    this.persistentStoragePath = getEnv('PERSISTENT_STORAGE_PATH', true)!
  }

  private static readonly DEFAULT_EXPIRATION_TIME: number = 60 * 30 // 30 minutes

  /**
   * The {@link RedisDBDataSource} which is used for the cache.
   */
  public get redisDataSource(): RedisDBDataSource {
    return this.cache.dataSource
  }

  /**
   * Gets the cached element with the given UUID.
   * @param uuid The UUID of the element to get.
   */
  public async get(uuid: string): Promise<CachedElement> {
    return this.cache.findById(uuid)
  }

  /**
   * Adds a new element to the cache.
   *
   * Note that this function ignores any provided UUID and instead generates a new one. This is to prevent the user from
   * accidentally overwriting an existing element.
   * @param cachedElement The element to add.
   * @returns The element which was added, including the auto-generated UUID.
   * @since 0.2.0
   */
  public async add(cachedElement: DataObject<CachedElement>): Promise<Required<CachedElement>> {
    try {
      // Generate a UUID for the element
      const newId: UUIDV4 = this.cache.genNewCacheUUID()

      // Set the expiration date if it is not already set
      if (!cachedElement.expiresAt) {
        cachedElement.expiresAt = Date.now() + CacheService.DEFAULT_EXPIRATION_TIME
      }

      const dbElement = <Required<CachedElement>>await this.cache.create({
        ...cachedElement,
        id: newId,
      } as DataObject<CachedElement>)

      // Add required ttl
      await this.cache.setCacheExpiration(dbElement, true)

      return dbElement
    } catch (e) {
      console.error((<Error>e).name, (<Error>e).message, (<Error>e).stack ?? '')
      throw new CacheError(`Failed to add element to cache: ${(<Error>e).message}`)
    }
  }

  /**
   * Gets the filename for the given file in the persistent storage.
   * @param uuidDiscriminator The UUID discriminator to use for the file.
   * @param filename The name of the file.
   * @since 0.2.0
   * @private
   */
  private getStoreFilename(uuidDiscriminator: string, filename: string): string {
    return `${uuidDiscriminator}-${filename}`
  }

  /**
   * Gets the path to the given file in the persistent storage.
   * @param storeFilename The name of the file which was formatted using {@link getStoreFilename}.
   * @private
   */
  private getStoreFilePath(storeFilename: string): string {
    return path.join(this.persistentStoragePath, storeFilename)
  }

  /**
   * Saves the given file to the persistent storage.
   * @param filename The name of the file.
   * @param fileContent The content of the file.
   * @param uuidDiscriminator The UUID discriminator to use for the file.
   * @returns The filename of the cached file.
   * @since 0.2.0
   * @private
   */
  private async saveToPersistentStorage(
    filename: string,
    fileContent: string,
    uuidDiscriminator: string,
  ): Promise<string> {
    const storeFilename: string = this.getStoreFilename(uuidDiscriminator, filename)
    const storeFilePath: string = this.getStoreFilePath(storeFilename)
    await fs.writeFile(storeFilePath, fileContent)
    return storeFilename
  }

  /**
   * Reads the given file from the persistent storage.
   * @param storeFilePath The path to the file in the persistent storage.
   * @since 0.2.0
   * @private
   */
  private async readFromPersistentStorage(storeFilePath: string): Promise<string> {
    try {
      return await fs.readFile(storeFilePath, { encoding: 'utf-8' })
    } catch (e) {
      if ('code' in e && e.code === 'ENOENT') {
        throw new CacheStoredFileNotFound(`File '${storeFilePath}' not found`)
      }

      // Other unexpected error
      throw e
    }
  }

  /**
   * Adds a new file to the cache and saves it to the persistent storage.
   * @param filename The name of the file.
   * @param fileContent The content of the file.
   * @param ttl The time-to-live of the file in seconds. (Default: 30 minutes)
   * @returns The element which was added, including the auto-generated UUID. It also contains the path to the file in
   * the server storage.
   * @since 0.2.0
   */
  public async addFile(
    filename: string,
    fileContent: string,
    ttl: number = CacheService.DEFAULT_EXPIRATION_TIME,
  ): Promise<Required<CachedElement>> {
    const cachedElement = await this.add({
      filename: filename,
      storeFilename: undefined,
      expiresAt: getDateNowInSeconds() + ttl,
    })

    // Save the file to the persistent storage
    cachedElement.storeFilename = await this.saveToPersistentStorage(
      filename,
      fileContent,
      cachedElement.id,
    )

    // Set the store filename in the database
    await this.redisDataSource.hset(
      cachedElement.redisKey,
      'storeFilename',
      cachedElement.storeFilename,
    )

    return cachedElement
  }

  /**
   * Gets the file from the given {@link CachedElement.id cached element id} and returns its content.
   * @param uuid The UUID of the {@link CachedElement}, which is used to get the {@link CachedElement.storeFilename}.
   * @returns The file content.
   */
  public async getFile(uuid: string): Promise<{
    mimeType: string
    fileContent: string
    originalFilename: string
  }> {
    const cachedElement = await this.cache.findById(uuid)
    if (!cachedElement) {
      throw new CacheRedisKeyNotFoundError(`Cached element with UUID '${uuid}' not found`)
    } else if (!cachedElement.storeFilename) {
      throw new CacheStoredFileNotFound(
        `Cached element with UUID '${uuid}' does not have a stored file`,
      )
    }

    const content = await this.readFromPersistentStorage(
      this.getStoreFilePath(cachedElement.storeFilename),
    )
    const mimeType = checkFileExtensionForMimeType(getFileExtension(cachedElement.storeFilename))
    return {
      mimeType,
      fileContent: content,
      originalFilename: cachedElement.filename,
    }
  }
}
