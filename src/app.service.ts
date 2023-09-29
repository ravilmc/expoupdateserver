import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateService } from './update.service';
import { UpdateType } from './app.dto';
import { Response } from 'express';
import { join } from 'path';
import { existsSync, readFileSync } from 'fs';
import * as mime from 'mime';
import { ConfigService } from '@nestjs/config';

interface ManifestRequest {
  protocolVersion: 0 | 1;
  platform: 'ios' | 'android';
  runtimeVersion: string;
  currentUpdateId: string;
  res: Response;
}

interface AssetRequest {
  platform: 'ios' | 'android';
  runtimeVersion: string;
  assetName: string;
  res: Response;
}

@Injectable()
export class AppService {
  constructor(
    private readonly updateService: UpdateService,
    private readonly configService: ConfigService,
  ) {}

  async getManifest({
    currentUpdateId,
    platform,
    protocolVersion,
    runtimeVersion,
    res,
  }: ManifestRequest) {
    const updateVersion =
      await this.updateService.getUpdateVersion(runtimeVersion);

    if (!updateVersion) {
      throw new NotFoundException('Update not found');
    }

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

  async getAsset({ runtimeVersion, assetName, platform, res }: AssetRequest) {
    const updateDirectory = this.configService.get<string>('UPDATE_DIR');
    const updateVersion =
      await this.updateService.getUpdateVersion(runtimeVersion);

    if (!updateVersion) {
      throw new NotFoundException('Update not found');
    }

    const { metadataJson } = await this.updateService.getUpdateMetadata(
      runtimeVersion,
      updateVersion,
    );
    const updateAssetName = assetName.replace(
      join(runtimeVersion, updateVersion) + '/',
      '',
    );

    console.log('asset', updateAssetName);
    const assetMetaData = metadataJson.fileMetadata[platform].assets.find(
      (asset) => asset.path === updateAssetName,
    );

    const isLaunchAsset =
      metadataJson.fileMetadata[platform].bundle === updateAssetName;

    let mimeType: string;

    if (isLaunchAsset) {
      mimeType = 'application/javascript';
    } else {
      mimeType = mime.getType(assetMetaData.ext);
    }
    if (!mimeType) {
      throw new NotFoundException('Asset not found');
    }

    const absolutePath = join(
      updateDirectory,
      runtimeVersion,
      updateVersion,
      updateAssetName,
    );

    console.log(absolutePath);

    if (!existsSync(absolutePath)) {
      throw new NotFoundException('Asset not found');
    }

    try {
      const asset = readFileSync(absolutePath, null);
      res.statusCode = 200;
      res.setHeader(
        'Content-Type',
        isLaunchAsset ? 'application/javascript' : mimeType,
      );
      return res.send(asset);
    } catch (e) {}
  }
}
