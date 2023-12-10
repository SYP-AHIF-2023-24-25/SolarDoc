import { BindingScope, injectable } from '@loopback/core'
import { repository } from '@loopback/repository'
import { CacheRepository, UUIDV4 } from '../repositories'
import { CachedElement } from '../models'
import { DataObject } from '@loopback/repository/src/common-types'
import {getEnv} from "../env";
import * as fs from "fs/promises";
import * as path from "path";
import {getDateNowInSeconds} from "../utils";

@injectable({ scope: BindingScope.TRANSIENT })
export class CacheService {
  private readonly persistentStoragePath: string

  constructor(@repository(CacheRepository) public cache: CacheRepository) {
    this.persistentStoragePath = getEnv('PERSISTENT_STORAGE_PATH', true)!
  }

  private static readonly DEFAULT_EXPIRATION_TIME: number = 60 * 30 // 30 minutes

  public async get(uuid: string): Promise<CachedElement> {
    return this.cache.findById(uuid);
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
      throw e
    }
  }

  /**
   * Saves the given file to the persistent storage.
   * @param filename The name of the file.
   * @param fileContent The content of the file.
   * @param uuidDiscriminator The UUID discriminator to use for the file.
   * @returns The path to the file (in server storage).
   * @private
   */
  private async saveToPersistentStorage(
    filename: string,
    fileContent: string,
    uuidDiscriminator: string
  ): Promise<string> {
    const storeFilename: string = `${uuidDiscriminator}-${filename}`
    const storeFilePath: string = path.join(this.persistentStoragePath, storeFilename)
    await fs.writeFile(storeFilePath, fileContent)
    return storeFilePath
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
    ttl: number = CacheService.DEFAULT_EXPIRATION_TIME
  ): Promise<Required<CachedElement>> {
    const cachedElement = await this.add({
      name: filename,
      storageURL: undefined,
      expiresAt: getDateNowInSeconds() + ttl,
    })

    // Save the file to the persistent storage
    cachedElement.storageURL = await this.saveToPersistentStorage(filename, fileContent, cachedElement.id)

    return cachedElement
  }
}
