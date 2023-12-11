import { model, property } from '@loopback/repository'
import { RedisEntity } from './abstract/redis-entity'
import { CacheDtoModel, DownloadDtoModel } from './dto'

@model({ settings: { strict: false } })
export class CachedElement extends RedisEntity {
  @property({
    type: 'number',
    required: true,
  })
  expiresAt: number

  @property({
    type: 'string',
    required: true,
  })
  filename: string

  @property({
    type: 'string',
    required: false,
  })
  storeFilename: string | undefined;

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any

  /**
   * Create a new cached element.
   * @param data The data to create the cached element from. (Ignores any {@link CachedElement.uuid} property, as this
   * is auto-generated.)
   */
  constructor(data?: Partial<CachedElement>) {
    super(data)
  }

  /**
   * Returns whether this cached element has expired.
   * @since 0.2.0
   */
  public hasExpired(): boolean {
    return this.expiresAt <= Date.now()
  }

  public override get redisKey(): string {
    return `${CachedElement.modelName}:${this.id}`
  }

  /**
   * Converts this cached element to a {@link CacheDtoModel}.
   * @since 0.2.0
   */
  public toCacheDtoModel(): CacheDtoModel {
    return new CacheDtoModel({
      cacheUUID: this.id,
      expiresAt: this.expiresAt,
    })
  }

  /**
   * Converts this cached element to a {@link DownloadDtoModel}.
   * @param downloadURL The URL to download the file from.
   * @since 0.2.0
   */
  public toDownloadDtoModel(downloadURL: string): DownloadDtoModel {
    return new DownloadDtoModel({
      fileName: this.filename,
      downloadURL: downloadURL,
    })
  }
}

export interface CachedElementRelations {
  // describe navigational properties here
}

export type CachedElementWithRelations = CachedElement & CachedElementRelations
