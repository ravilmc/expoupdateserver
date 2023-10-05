import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UpdateService } from './update.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // TypeOrmModule.forRootAsync({
    //   useFactory: (congigService: ConfigService) => ({
    //     type: 'postgres',
    //     host: congigService.get('DATABASE_HOST'),
    //     username: congigService.get('DATABASE_USERNAME'),
    //     password: congigService.get('DATABASE_PASSWORD'),
    //     database: congigService.get('DATABASE_NAME'),
    //     port: congigService.get('DATABASE_PORT'),
    //     synchronize: true,
    //     autoLoadEntities: true,
    //   }),
    //   inject: [ConfigService],
    // }),
    // MetadataModule,
    // UpdateModule,
    // AssetModule,
    // ProjectModule,
    // BranchModule,
    // StorageModule,
    // UserModule,
    // IamModule,
    // CacheModule,
  ],
  controllers: [AppController],
  providers: [AppService, UpdateService],
})
export class AppModule {}
