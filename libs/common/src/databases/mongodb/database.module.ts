import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModelDefinition, MongooseModule } from '@nestjs/mongoose';

export interface MongoDatabaseModuleOptions {
  envKey: string;
  connectionName?: string;
}

@Module({})
export class MongoDatabaseModule {
  static forRoot(options: MongoDatabaseModuleOptions): DynamicModule {
    const { envKey, connectionName } = options;

    return {
      module: MongoDatabaseModule,
      imports: [
        MongooseModule.forRootAsync({
          connectionName,
          imports: [],
          useFactory: (configService: ConfigService) => ({
            uri: configService.get<string>(envKey),
          }),
          inject: [ConfigService],
        }),
      ],
      exports: [MongooseModule],
    };
  }

  static forFeature(
    models: ModelDefinition[],
    connectionName?: string,
  ): DynamicModule {
    return MongooseModule.forFeature(models, connectionName);
  }
}