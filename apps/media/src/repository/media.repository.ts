import { Injectable, Logger } from '@nestjs/common';
import { MongoAbstractRepository } from '@app/common';
import { MediaDocument } from '../models/media.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class MediaRepository extends MongoAbstractRepository<MediaDocument> {
  protected readonly logger = new Logger(MediaRepository.name);

  constructor(
    @InjectModel(MediaDocument.name, 'mediaService')
    mediaModel: Model<MediaDocument>,
  ) {
    super(mediaModel);
  }
}
