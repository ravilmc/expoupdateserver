import { Injectable } from '@nestjs/common';
import { CacheService } from 'src/cache/cache.service';

@Injectable()
export class RefreshTokenIdsStorage {
  constructor(private readonly cacheService: CacheService) {}

  async addRefreshTokenId(userId: number, refreshToken: string): Promise<void> {
    await this.cacheService.set(this.getRefreshTokenKey(userId), refreshToken);
  }

  async validateRefreshTokenId(
    userId: number,
    refreshToken: string,
  ): Promise<boolean> {
    const refreshTokenId = await this.cacheService.get(
      this.getRefreshTokenKey(userId),
    );
    return refreshTokenId === refreshToken;
  }

  async invalidateRefreshTokenId(userId: number): Promise<void> {
    await this.cacheService.del(this.getRefreshTokenKey(userId));
  }

  private getRefreshTokenKey(userId: number): string {
    return `refresh-token:${userId}`;
  }
}
