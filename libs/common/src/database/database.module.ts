import { Module, DynamicModule } from '@nestjs/common';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { ModelDefinition, MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

@Module({
  imports: [
    // MongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    // Postgres
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        ({
          type: 'postgres',
          url: configService.get<string>('POSTGRES_URI'),
          autoLoadEntities: true,
          synchronize: false, // Đặt true nếu muốn tự động sync entity (chỉ dùng cho dev)
        }) as TypeOrmModuleOptions,
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {
  static forMongooseFeature(models: ModelDefinition[]) {
    return MongooseModule.forFeature(models);
  }

  static forTypeOrmFeature(entities: any[]): DynamicModule {
    return TypeOrmModule.forFeature(entities);
  }
}
