import { model, property } from '@loopback/repository'

@model()
export class CacheDtoModel {
  @property({
    required: true,
    description:
      'The UUID of the presentation (which is used to access the cached rendered presentation)',
  })
  cacheUUID: string

  @property({
    required: true,
    description: 'The expiration date of the cache entry (in milliseconds since epoch)',
  })
  expiresAt: number
}
