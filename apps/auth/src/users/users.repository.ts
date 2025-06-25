import { MongoAbstractRepository, UserDocument } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UsersRepository extends MongoAbstractRepository<UserDocument> {
  protected readonly logger = new Logger(UsersRepository.name);

  constructor(
    @InjectModel(UserDocument.name, 'authService')
    private readonly userModel: Model<UserDocument>,
  ) {
    super(userModel);
  }

  async createUser(
    email: string,
    password: string,
    type: string,
  ): Promise<UserDocument> {
    const user = new this.model({ email, password, type });
    return user.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.model.findOne({ email }).exec();
  }

  async getAllUsers(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }
}
