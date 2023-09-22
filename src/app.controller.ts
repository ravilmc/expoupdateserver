import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  Query,
  Res,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('manifest')
  getMAnifest(
    // Protocol version
    @Headers('expo-protocol-version') expoProtocolVersion: string,

    // Platform
    @Headers('expo-platform') expoPlatform: string,
    @Query('platform') platform: string,

    // Runtime version
    @Headers('expo-runtime-version') expoRuntimeVersion: string,
    @Query('runtime-version') runtimeVersion: string,

    @Headers('expo-current-update-id') currentUpdateId: string,

    @Res() res: Response,
  ) {
    console.log({
      expoProtocolVersion,
      expoPlatform,
      platform,
      expoRuntimeVersion,
      runtimeVersion,
      currentUpdateId,
    });

    let protocolVersion: 0 | 1 = 0;

    // Validate expo-protocol-version header
    if (!!expoProtocolVersion) {
      if (expoProtocolVersion.split('.').length > 1) {
        throw new BadRequestException('Invalid expo-protocol-version header');
      }
      const expoProtocolVersionNumber = Number(expoProtocolVersion);
      if (expoProtocolVersionNumber !== 0 && expoProtocolVersionNumber !== 1) {
        throw new BadRequestException('Invalid expo-protocol-version header');
      }

      protocolVersion = expoProtocolVersionNumber as 0 | 1;
    }

    // Validate expo-platform header

    const requestedPlatform = platform || expoPlatform;

    if (requestedPlatform !== 'ios' && requestedPlatform !== 'android') {
      throw new BadRequestException('Invalid expo-platform header');
    }

    // Validate expo-runtime-version header

    const requestedRuntimeVersion = runtimeVersion || expoRuntimeVersion;

    if (!requestedRuntimeVersion) {
      throw new BadRequestException('Invalid expo-runtime-version header');
    }

    return this.appService.getManifest({
      protocolVersion,
      platform: requestedPlatform as 'ios' | 'android',
      runtimeVersion: requestedRuntimeVersion,
      currentUpdateId,
      res,
    });
  }

  @Get('assets')
  getManifestAssets() {}
}
