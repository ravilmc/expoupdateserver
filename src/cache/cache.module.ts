/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Global, Module } from '@nestjs/common';

import {
  CacheModule as NestCacheModule,
  CacheModuleAsyncOptions,
} from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        return {
          // @ts-ignore
          store: await redisStore({
            url: configService.get<string>('REDIS_URL'),
            password: configService.get<string>('REDIS_PASSWORD') || undefined,
          }),
        } as CacheModuleAsyncOptions;
      },
      inject: [ConfigService],
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
