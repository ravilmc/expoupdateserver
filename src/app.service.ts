import { Injectable } from '@nestjs/common';
import { UpdateService } from './update.service';
import { UpdateType } from './app.dto';
import { Response } from 'express';

interface ManifestRequest {
  protocolVersion: 0 | 1;
  platform: 'ios' | 'android';
  runtimeVersion: string;
  currentUpdateId: string;
  res: Response;
}

@Injectable()
export class AppService {
  constructor(private readonly updateService: UpdateService) {}

  async getManifest({
    currentUpdateId,
    platform,
    protocolVersion,
    runtimeVersion,
    res,
  }: ManifestRequest) {
    const updateVersion =
      await this.updateService.getUpdateVersion(runtimeVersion);
    const updateType = await this.updateService.getUpdateType(
      runtimeVersion,
      updateVersion,
    );

    if (updateType == UpdateType.ROLLBACK) {
    }
    return this.updateService.getUpdateManifest(
      runtimeVersion,
      updateVersion,
      platform,
      protocolVersion,
      currentUpdateId,
      res,
    );
  }
}
