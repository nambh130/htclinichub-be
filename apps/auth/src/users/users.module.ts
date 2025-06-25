import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongoDatabaseModule, UserDocument, UserSchema } from '@app/common';
import { UsersRepository } from './users.repository';

@Module({
  imports: [
    MongoDatabaseModule.forRoot({
      envKey: 'AUTH_SERVICE_URI',
      connectionName: 'authService',
    }),
    MongoDatabaseModule.forFeature(
      [{ name: UserDocument.name, schema: UserSchema }],
      'authService',
    ),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
