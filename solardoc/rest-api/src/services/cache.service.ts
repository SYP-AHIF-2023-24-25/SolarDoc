import {BindingScope, injectable} from '@loopback/core';
import {repository} from "@loopback/repository";
import {CacheRepository} from "../repositories";
import {CachedElement} from "../models";

@injectable({scope: BindingScope.TRANSIENT})
export class CacheService {
  constructor(
    @repository(CacheRepository) public cache: CacheRepository,
  ) {}

  public async get(uuid: string): Promise<CachedElement> {
    return await this.cache.findById(uuid);
  }

  public async add(cachedElement: CachedElement): Promise<CachedElement> {
    return await this.cache.create(cachedElement);
  }
}
