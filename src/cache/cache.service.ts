/* eslint-disable @typescript-eslint/ban-ts-comment */
//  @ts-nocheck

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  public async get<T>(key: string): Promise<T> {
    return (await this.cacheManager.store.get(key)) as T;
  }
  public async set(key: string, value: any, ttl?: number) {
    await this.cacheManager.store.set(
      key,
      value,
      {
        ttl: ttl || 0,
      },
      null,
    );
  }
  public async del(key: any) {
    await this.cacheManager.store.del(key);
  }
  public async reset() {
    await this.cacheManager.store.reset(null);
  }

  public async keys(pattern: string): Promise<string[]> {
    return (await this.cacheManager.store.keys(pattern, null)) as string[];
  }
}
