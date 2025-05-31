import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongoDatabaseModule, UserDocument, UserSchema } from '@app/common';
import { UsersRepository } from './users.repository';

@Module({
  imports: [
    MongoDatabaseModule,
    MongoDatabaseModule.forFeature([
      {
        name: UserDocument.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
