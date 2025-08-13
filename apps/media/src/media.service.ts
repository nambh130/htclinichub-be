import {
  setAudit,
  CLOUDINARY,
  MediaDto,
  TokenPayload,
  FileCategory,
  updateAudit,
  deleteAudit,
} from '@app/common';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { MediaRepository } from './repository/media.repository';
import { MediaDocument } from './models/media.schema';
import mongoose from 'mongoose';

@Injectable()
export class MediaService {
  constructor(
    @Inject(CLOUDINARY) private cloudinaryClient: typeof cloudinary,
    private readonly mediaRepository: MediaRepository,
  ) { }

  //   async getFileById(
  //     id: string | null | undefined,
  //   ): Promise<MediaDocument | null> {
  //     if (!id) return null;
  // console.log('[MediaService] getFileById called with:', id);
  //     const media = await this.mediaRepository.findOne({
  //       _id: id,
  //       isDeleted: { $ne: true },
  //     });

  //     console.log('[MediaService] media called with:', media);

  //     return media ?? null;
  //   }

  async getFileById(
    id: string | null | undefined,
  ): Promise<MediaDocument | null> {
    console.log('[MediaService] getFileById called with:', id);
    if (!id) return null;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null; // hoặc throw new BadRequestException('Invalid media ID');
    }

    return await this.mediaRepository.findOne({
      _id: id,
      isDeleted: { $ne: true },
    });
  }

  async getAvatarPatient(
    patientId: string | null | undefined,
  ): Promise<MediaDocument | null> {
    console.log('[MediaService] getFileById called with:', patientId);
    if (!patientId) return null;

    return await this.mediaRepository.findOne({
      createdById: patientId,
      isDeleted: { $ne: true },
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    fileCategory: FileCategory,
    currentUser: TokenPayload,
  ): Promise<MediaDto> {
    this.validateFile(file, fileCategory);

    const uploadResult = await this.uploadToCloudinary(
      file.buffer,
      fileCategory,
    );

    const mediaData = {
      publicId: uploadResult.public_id,
      name: uploadResult.original_filename,
      type: fileCategory,
      url: uploadResult.secure_url,
      domain: new URL(uploadResult.secure_url).hostname,
      mimetype: file.mimetype,
      originalName: file.originalname,
      size: file.size,
    };

    setAudit(mediaData, currentUser);

    const document = await this.mediaRepository.create(mediaData);
    return this.mapToDto(document);
  }

  async uploadAvatarPatient(
    file: Express.Multer.File,
    fileCategory: FileCategory,
    currentUser: string,
  ): Promise<MediaDto> {
    this.validateFile(file, fileCategory);

    const uploadResult = await this.uploadToCloudinary(
      file.buffer,
      fileCategory,
    );

    const mediaData = {
      publicId: uploadResult.public_id,
      name: uploadResult.original_filename,
      type: fileCategory,
      url: uploadResult.secure_url,
      domain: new URL(uploadResult.secure_url).hostname,
      mimetype: file.mimetype,
      originalName: file.originalname,
      size: file.size,
    };

    setAudit(mediaData, {
      userId: currentUser,
      actorType: "patient",
    });

    const document = await this.mediaRepository.create(mediaData);
    return this.mapToDto(document);
  }

  async uploadMultiFiles(
    files: Express.Multer.File[],
    fileCategory: FileCategory,
    currentUser: TokenPayload,
  ): Promise<MediaDto[]> {
    const results: MediaDto[] = [];
    for (const file of files) {
      const dto = await this.uploadFile(file, fileCategory, currentUser);
      results.push(dto);
    }
    return results;
  }

  async replaceFile(
    id: string,
    file: Express.Multer.File,
    currentUser: TokenPayload,
  ): Promise<MediaDto> {
    const media = await this.mediaRepository.findOne({
      _id: id,
      isDeleted: { $ne: true },
    });
    if (!media) throw new NotFoundException(`Media with id ${id} not found`);

    // Validate that uploaded file matches media type
    if (!this.isFileTypeValidForMedia(file.mimetype, media.type)) {
      throw new BadRequestException(
        `Uploaded file type (${file.mimetype}) does not match existing media type (${media.type})`,
      );
    }

    const resourceType = this.getResourceType(media.type);

    await this.cloudinaryClient.uploader.destroy(media.publicId, {
      resource_type: resourceType,
    });

    // Upload new file
    const uploadResult = await this.uploadToCloudinary(file.buffer, media.type);

    const updatedData = {
      publicId: uploadResult.public_id,
      name: uploadResult.original_filename,
      url: uploadResult.secure_url,
      domain: new URL(uploadResult.secure_url).hostname,
      mimetype: file.mimetype,
      originalName: file.originalname,
      size: file.size,
    };

    updateAudit(updatedData, currentUser);

    const updatedDoc = await this.mediaRepository.findOneAndUpdate(
      { _id: id },
      { $set: updatedData },
    );

    if (!updatedDoc) {
      throw new NotFoundException(`Failed to update media with id ${id}`);
    }

    return this.mapToDto(updatedDoc);
  }

  async updateAvatarPatient(
    patientId: string,
    file: Express.Multer.File,
  ): Promise<MediaDto> {
    const media = await this.mediaRepository.findOne({
      createdById: patientId,
      isDeleted: { $ne: true },
    });
    if (!media) throw new NotFoundException(`Media with id ${patientId} not found`);

    // Validate that uploaded file matches media type
    if (!this.isFileTypeValidForMedia(file.mimetype, media.type)) {
      throw new BadRequestException(
        `Uploaded file type (${file.mimetype}) does not match existing media type (${media.type})`,
      );
    }

    const resourceType = this.getResourceType(media.type);

    await this.cloudinaryClient.uploader.destroy(media.publicId, {
      resource_type: resourceType,
    });

    // Upload new file
    const uploadResult = await this.uploadToCloudinary(file.buffer, media.type);

    const updatedData = {
      publicId: uploadResult.public_id,
      name: uploadResult.original_filename,
      url: uploadResult.secure_url,
      domain: new URL(uploadResult.secure_url).hostname,
      mimetype: file.mimetype,
      originalName: file.originalname,
      size: file.size,
    };

    updateAudit(updatedData, {
      userId: patientId,
      actorType: "patient",
    });

    const updatedDoc = await this.mediaRepository.findOneAndUpdate(
      { createdById: patientId },
      { $set: updatedData },
    );

    if (!updatedDoc) {
      throw new NotFoundException(`Failed to update media with id ${patientId}`);
    }

    return this.mapToDto(updatedDoc);
  }

  async deleteFile(id: string, currentUser: TokenPayload): Promise<MediaDto> {
    const media = await this.mediaRepository.findOne({
      _id: id,
      isDeleted: { $ne: true },
    });
    if (!media) throw new NotFoundException(`Media with id ${id} not found`);

    deleteAudit(media, currentUser);

    const updatedDoc = await this.mediaRepository.findOneAndUpdate(
      { _id: id },
      { $set: media },
    );

    if (!updatedDoc) {
      throw new NotFoundException(`Failed to update media with id ${id}`);
    }

    return this.mapToDto(updatedDoc);
  }

  private mapToDto(document: MediaDocument): MediaDto {
    return {
      _id: document._id.toString(),
      publicId: document.publicId,
      name: document.name,
      type: document.type,
      url: document.url,
      domain: document.domain,
      mimetype: document.mimetype,
      originalName: document.originalName,
      size: document.size,
    };
  }

  private validateFile(
    file: Express.Multer.File,
    fileCategory: FileCategory,
  ): void {
    if (!file || typeof file !== 'object' || !('buffer' in file)) {
      throw new Error('Invalid or missing file buffer');
    }

    const buffer = file.buffer;
    if (!(buffer instanceof Buffer)) {
      throw new Error('File buffer is not a valid Buffer');
    }

    const allowedMimeTypes: Record<FileCategory, string[]> = {
      image: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
      pdf: ['application/pdf'],
      document: [
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/vnd.oasis.opendocument.text',
      ],
      other: [],
    };

    const allowedTypes = allowedMimeTypes[fileCategory] ?? [];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error(
        `Invalid file type for category '${fileCategory}'. Allowed: ${allowedTypes.join(', ')}`,
      );
    }
  }

  private isFileTypeValidForMedia(
    mimetype: string,
    mediaType: string,
  ): boolean {
    const allowedMimeTypes: Record<string, string[]> = {
      image: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
      pdf: ['application/pdf'],
      document: [
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/vnd.oasis.opendocument.text',
      ],
      other: [], // optionally allow any, or enforce stricter rules
    };

    const allowedTypes = allowedMimeTypes[mediaType] ?? [];
    return allowedTypes.includes(mimetype);
  }

  private uploadToCloudinary(
    buffer: Buffer,
    fileCategory: FileCategory,
  ): Promise<UploadApiResponse> {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      const folder = `htclinichub/${fileCategory}s`;
      const resourceType = this.getResourceType(fileCategory);

      const stream = this.cloudinaryClient.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
        },
        (error, result) => {
          if (error) {
            return reject(
              new Error(
                `Cloudinary upload error: ${error.message} (code: ${error.http_code ?? 'N/A'})`,
              ),
            );
          }
          if (!result) {
            return reject(new Error('Upload result is undefined'));
          }
          resolve(result);
        },
      );

      Readable.from(buffer).pipe(stream);
    });
  }

  private getResourceType(fileCategory: FileCategory): 'image' | 'raw' {
    switch (fileCategory) {
      case 'image':
        return 'image';
      case 'pdf':
      case 'document':
      case 'other':
        return 'raw';
    }
  }
  async deleteMultipleFiles(
    ids: string[],
    currentUser: TokenPayload,
  ): Promise<MediaDto[]> {
    console.log('ids: ', ids);
    const objectIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
    console.log('objectIds: ', objectIds);

    if (objectIds.length === 0) return [];

    // Fetch media docs
    const mediaDocs = await this.mediaRepository.find({
      _id: { $in: objectIds },
      isDeleted: { $ne: true },
    });
    console.log('mediaDocs: ', mediaDocs);

    if (mediaDocs.length === 0) return [];

    // Group publicIds by resourceType
    const imagePublicIds = mediaDocs
      .filter((doc) => this.getResourceType(doc.type) === 'image')
      .map((doc) => doc.publicId);

    const rawPublicIds = mediaDocs
      .filter((doc) => this.getResourceType(doc.type) === 'raw')
      .map((doc) => doc.publicId);

    // Delete from Cloudinary
    const deletePromises: Promise<any>[] = [];

    if (imagePublicIds.length > 0) {
      deletePromises.push(
        this.cloudinaryClient.api.delete_resources(imagePublicIds, {
          resource_type: 'image',
        }),
      );
    }

    if (rawPublicIds.length > 0) {
      deletePromises.push(
        this.cloudinaryClient.api.delete_resources(rawPublicIds, {
          resource_type: 'raw',
        }),
      );
    }

    await Promise.all(deletePromises);

    // Mark as deleted in DB
    const updatedDocs: MediaDto[] = [];

    for (const doc of mediaDocs) {
      deleteAudit(doc, currentUser);
      const updated = await this.mediaRepository.findOneAndUpdate(
        { _id: doc._id },
        { $set: doc },
      );
      if (updated) {
        updatedDocs.push(this.mapToDto(updated));
      }
    }

    return updatedDocs;
  }
}
