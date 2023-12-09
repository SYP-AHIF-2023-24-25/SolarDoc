import { BindingScope, injectable } from '@loopback/core'
import { repository } from '@loopback/repository'
import { CacheRepository, UUIDV4 } from '../repositories'
import { CachedElement } from '../models'
import { DataObject } from '@loopback/repository/src/common-types'

@injectable({ scope: BindingScope.TRANSIENT })
export class CacheService {
  constructor(@repository(CacheRepository) public cache: CacheRepository) {}

  private static readonly DEFAULT_EXPIRATION_TIME: number = 60 * 30 // 30 minutes

  public async get(uuid: string): Promise<CachedElement> {
    return await this.cache.findById(uuid)
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
  public async add(cachedElement: DataObject<CachedElement>): Promise<CachedElement> {
    try {
      // Generate a UUID for the element
      const newId: UUIDV4 = this.cache.genNewCacheUUID()

      // Set the expiration date if it is not already set
      if (!cachedElement.expiresAt) {
        cachedElement.expiresAt = Date.now() + CacheService.DEFAULT_EXPIRATION_TIME
      }

      const dbElement: CachedElement = await this.cache.create({
        ...cachedElement,
        id: newId,
      } as DataObject<CachedElement>)
      await this.cache.setCacheExpiration(dbElement, true)
      return dbElement
    } catch (e) {
      console.error((<Error>e).name, (<Error>e).message, (<Error>e).stack || '')
      throw e
    }
  }
}
