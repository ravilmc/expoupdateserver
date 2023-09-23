import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync } from 'fs';
import { stat, readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { UpdateType } from './app.dto';
import { createHash } from 'crypto';
import { IMetaDataJSON } from './types/MetadataJSON';
import { convertSHA256HashToUUID, getBase64URLEncoding } from './utils';
import * as mime from 'mime';
import * as FormData from 'form-data';
import { Response } from 'express';
type GetAssetMetadataArg =
  | {
      updateVersion: string;
      filePath: string;
      ext: null;
      isLaunchAsset: true;
      runtimeVersion: string;
      platform: string;
    }
  | {
      updateVersion: string;
      filePath: string;
      ext: string;
      isLaunchAsset: false;
      runtimeVersion: string;
      platform: string;
    };

@Injectable()
export class UpdateService {
  constructor(private readonly configService: ConfigService) {}

  async getUpdateVersion(runtimeVersion: string) {
    const updateDirectory = this.configService.get<string>('UPDATE_DIR');
    if (!updateDirectory) {
      throw new BadRequestException('Update directory not set');
    }
    const updateDirectoryForRuntime = join(updateDirectory, runtimeVersion);
    const directoryExists = existsSync(updateDirectoryForRuntime);
    if (!directoryExists) {
      throw new NotFoundException("Runtime version  doesn't exist");
    }

    const filesInDirectory = await readdir(updateDirectoryForRuntime);
    const directoryMapping = await Promise.all(
      filesInDirectory.map(async (file) => {
        const fileStat = await stat(join(updateDirectoryForRuntime, file));
        return {
          fileName: file,
          isDirectory: fileStat.isDirectory(),
        };
      }),
    );

    const directories = directoryMapping.filter((dm) => dm.isDirectory);

    const sortedDirectories = directories.sort((a, b) => {
      return Number(b.fileName) - Number(a.fileName);
    });

    return sortedDirectories[0].fileName;
  }

  async getUpdateType(runtimeVersion: string, updateVersion: string) {
    const updateDirectory = this.configService.get<string>('UPDATE_DIR');

    const versionDirectory = join(
      updateDirectory,
      runtimeVersion,
      updateVersion,
    );
    const versionDirectoryExists = existsSync(versionDirectory);
    if (!versionDirectoryExists) {
      throw new NotFoundException("Update version  doesn't exist");
    }

    const filesInDirectory = await readdir(versionDirectory);

    if (filesInDirectory.includes('rollback')) {
      return UpdateType.ROLLBACK;
    }
    return UpdateType.NORMAL_UPDATE;
  }

  async getRollbackUpdate() {}

  async getUpdateManifest(
    runtimeVersion: string,
    updateVersion: string,
    platform: 'ios' | 'android',
    protocolVersion: 0 | 1,
    currentUpdateId: string,
    res: Response,
  ) {
    console.log({
      runtimeVersion,
      updateVersion,
      platform,
      protocolVersion,
      currentUpdateId,
    });
    const { createdAt, id, metadataJson } = await this.getUpdateMetadata(
      runtimeVersion,
      updateVersion,
    );

    if (currentUpdateId === id && protocolVersion === 1) {
      throw new NotFoundException('No update available');
    }
    console.log(updateVersion);
    const expoConfig = await this.getExpoConfig(runtimeVersion, updateVersion);

    const platformSpecificMetadata = metadataJson.fileMetadata[platform];

    const manifest = {
      id: convertSHA256HashToUUID(id),
      createdAt,
      runtimeVersion,
      assets: await Promise.all(
        platformSpecificMetadata.assets.map((asset) =>
          this.getAssetMetadata({
            ext: asset.ext,
            filePath: asset.path,
            updateVersion,
            runtimeVersion,
            platform,
            isLaunchAsset: false,
          }),
        ),
      ),
      launchAsset: await this.getAssetMetadata({
        ext: null,
        filePath: platformSpecificMetadata.bundle,
        updateVersion,
        runtimeVersion,
        platform,
        isLaunchAsset: true,
      }),
      metadata: {},
      extra: {
        expoClient: expoConfig,
      },
    };

    // TODO: Implement signature

    const form = new FormData();

    form.append('manifest', JSON.stringify(manifest), {
      contentType: 'application/json',
      header: {
        'content-type': 'application/json; charset=UTF-8',
      },
    });

    form.append(
      'extensions',
      JSON.stringify({
        assetRequestHeaders: {},
      }),
      {
        contentType: 'application/json',
      },
    );
    res.statusCode = 200;
    res.setHeader('expo-protocol-version', protocolVersion);
    res.setHeader('expo-sfv-version', 0);
    res.setHeader('cache-control', 'private, max-age=0');
    res.setHeader(
      'content-type',
      `multipart/mixed; boundary=${form.getBoundary()}`,
    );
    form.pipe(res);
  }

  async getUpdateMetadata(runtimeVersion: string, updateVersion: string) {
    const updateDirectory = this.configService.get<string>('UPDATE_DIR');

    const versionDirectory = join(
      updateDirectory,
      runtimeVersion,
      updateVersion,
    );

    const metadataPath = join(versionDirectory, 'metadata.json');

    const updateMetadataBuffer = await readFile(metadataPath, null);
    const metadataJson = JSON.parse(
      updateMetadataBuffer.toString('utf-8'),
    ) as IMetaDataJSON;
    const metadataStat = await stat(metadataPath);

    return {
      metadataJson,
      createdAt: new Date(metadataStat.birthtime).toISOString(),
      id: createHash('sha256').update(updateMetadataBuffer).digest('hex'),
    };
  }

  async getExpoConfig(runtimeVersion: string, updateVersion: string) {
    try {
      const updateDirectory = this.configService.get<string>('UPDATE_DIR');
      const versionDirectory = join(
        updateDirectory,
        runtimeVersion,
        updateVersion,
      );

      console.log({ updateDirectory, runtimeVersion, updateVersion });

      console.log({ versionDirectory });
      const expoConfigPath = join(versionDirectory, 'expoConfig.json');
      const expoConfigBuffer = await readFile(expoConfigPath, null);
      const expoConfigJson = JSON.parse(expoConfigBuffer.toString('utf-8'));
      return expoConfigJson;
    } catch (error) {
      console.log(error);
      throw new NotFoundException('No expo config json found');
    }
  }

  async getAssetMetadata({
    ext,
    filePath,
    isLaunchAsset,
    platform,
    runtimeVersion,
    updateVersion,
  }: GetAssetMetadataArg) {
    const updateDirectory = this.configService.get<string>('UPDATE_DIR');
    const versionDirectory = join(
      updateDirectory,
      runtimeVersion,
      updateVersion,
    );
    const assetFilePath = join(versionDirectory, filePath);
    const asset = await readFile(assetFilePath, null);
    const assetHash = getBase64URLEncoding(
      createHash('sha256').update(asset).digest('base64'),
    );
    const key = createHash('md5').update(asset).digest('hex');

    const keyExtensionSuffix = isLaunchAsset ? 'bundle' : ext;

    const contentType = isLaunchAsset
      ? 'application/javascript'
      : mime.getType(ext);

    const hostName = this.configService.get('HOSTNAME');
    const assetUrl = `${hostName}/assets?asset=${assetFilePath.replace(
      updateDirectory + '/',
      '',
    )}&runtimeVersion=${runtimeVersion}&platform=${platform}`;

    return {
      hash: assetHash,
      key,
      fileExtension: `.${keyExtensionSuffix}`,
      contentType,
      url: assetUrl,
    };
  }
}
