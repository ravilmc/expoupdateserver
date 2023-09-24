import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UpdateService } from './update.service';
import { MetadataModule } from './metadata/metadata.module';
import { UpdateModule } from './update/update.module';
import { AssetModule } from './asset/asset.module';
import { ProjectModule } from './project/project.module';
import { BranchModule } from './branch/branch.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MetadataModule,
    UpdateModule,
    AssetModule,
    ProjectModule,
    BranchModule,
    StorageModule,
  ],
  controllers: [AppController],
  providers: [AppService, UpdateService],
})
export class AppModule {}
