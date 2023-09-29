import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UpdateService } from './update.service';
import { MetadataModule } from './metadata/metadata.module';
import { UpdateModule } from './update/update.module';
import { AssetModule } from './asset/asset.module';
import { ProjectModule } from './project/project.module';
import { BranchModule } from './branch/branch.module';
import { StorageModule } from './storage/storage.module';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IamModule } from './iam/iam.module';
import { CacheModule } from './cache/cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (congigService: ConfigService) => ({
        type: 'postgres',
        host: congigService.get('DATABASE_HOST'),
        username: congigService.get('DATABASE_USERNAME'),
        password: congigService.get('DATABASE_PASSWORD'),
        database: congigService.get('DATABASE_NAME'),
        port: congigService.get('DATABASE_PORT'),
        synchronize: true,
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    MetadataModule,
    UpdateModule,
    AssetModule,
    ProjectModule,
    BranchModule,
    StorageModule,
    UserModule,
    IamModule,
    CacheModule,
  ],
  controllers: [AppController],
  providers: [AppService, UpdateService],
})
export class AppModule {}
