import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {RedisDBDataSource} from '../datasources';
import {CachedElement, CachedElementRelations} from '../models';

export class CacheRepository extends DefaultCrudRepository<
  CachedElement,
  typeof CachedElement.prototype.uuid,
  CachedElementRelations
> {
  constructor(
    @inject('datasources.redisdb') dataSource: RedisDBDataSource,
  ) {
    super(CachedElement, dataSource);
  }
}
