import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { TokenPayload } from '@app/common';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get('get/:id')
  async getFileById(@Param('id') id: string) {
    return this.mediaService.getFileById(id);
  }

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Headers('x-current-user') currentUserRaw: string,
  ) {
    const currentUser = JSON.parse(currentUserRaw) as TokenPayload;

    return this.mediaService.uploadFile(file, 'image', currentUser);
  }

  @Post('update/:id')
  @UseInterceptors(FileInterceptor('file'))
  async replaceFile(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Headers('x-current-user') currentUserRaw: string,
  ) {
    const currentUser = JSON.parse(currentUserRaw) as TokenPayload;

    return this.mediaService.replaceFile(id, file, currentUser);
  }

  @Post('delete/:id')
  async deleteFile(
    @Param('id') id: string,
    @Headers('x-current-user') currentUserRaw: string,
  ) {
    const currentUser = JSON.parse(currentUserRaw) as TokenPayload;

    return this.mediaService.deleteFile(id, currentUser);
  }

  @Post('upload-images')
  @UseInterceptors(FilesInterceptor('files', 3)) // max 3 files
  async uploadImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Headers('x-current-user') currentUserRaw: string,
  ) {
    const currentUser = JSON.parse(currentUserRaw) as TokenPayload;

    // Validate min files
    if (!files || files.length < 1) {
      throw new BadRequestException('At least one file must be uploaded.');
    }

    if (files.length > 3) {
      throw new BadRequestException('Maximum 3 files allowed.');
    }

    return this.mediaService.uploadMultiFiles(files, 'image', currentUser);
  }

  @Post('upload-pdf')
  @UseInterceptors(FileInterceptor('file'))
  uploadPdf(
    @UploadedFile() file: Express.Multer.File,
    @Headers('x-current-user') currentUserRaw: string,
  ) {
    const currentUser = JSON.parse(currentUserRaw) as TokenPayload;

    return this.mediaService.uploadFile(file, 'pdf', currentUser);
  }

  @Post('upload-pdfs')
  @UseInterceptors(FilesInterceptor('files', 3)) // max 3 files
  async uploadPdfs(
    @UploadedFiles() files: Express.Multer.File[],
    @Headers('x-current-user') currentUserRaw: string,
  ) {
    const currentUser = JSON.parse(currentUserRaw) as TokenPayload;

    // Validate min files
    if (!files || files.length < 1) {
      throw new BadRequestException('At least one file must be uploaded.');
    }

    if (files.length > 3) {
      throw new BadRequestException('Maximum 3 files allowed.');
    }

    return this.mediaService.uploadMultiFiles(files, 'pdf', currentUser);
  }

  @Post('upload-document')
  @UseInterceptors(FileInterceptor('file'))
  uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Headers('x-current-user') currentUserRaw: string,
  ) {
    const currentUser = JSON.parse(currentUserRaw) as TokenPayload;

    return this.mediaService.uploadFile(file, 'document', currentUser);
  }

  @Post('upload-documents')
  @UseInterceptors(FilesInterceptor('files', 3)) // max 3 files
  async uploadDocuments(
    @UploadedFiles() files: Express.Multer.File[],
    @Headers('x-current-user') currentUserRaw: string,
  ) {
    const currentUser = JSON.parse(currentUserRaw) as TokenPayload;

    // Validate min files
    if (!files || files.length < 1) {
      throw new BadRequestException('At least one file must be uploaded.');
    }

    if (files.length > 3) {
      throw new BadRequestException('Maximum 3 files allowed.');
    }

    return this.mediaService.uploadMultiFiles(files, 'document', currentUser);
  }
}
