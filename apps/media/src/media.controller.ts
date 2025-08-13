import {
  BadRequestException,
  Body,
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
  constructor(private readonly mediaService: MediaService) { }

  @Get('get/:id')
  async getFileById(@Param('id') id: string) {
    return this.mediaService.getFileById(id);
  }

  @Get('get-avatar-patient/:patientId')
  async getAvatarPatient(@Param('patientId') patientId: string) {
    return this.mediaService.getAvatarPatient(patientId);
  }

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Headers('x-current-user') currentUserRaw: string,
  ) {
    console.log(currentUserRaw);
    const currentUser = JSON.parse(currentUserRaw) as TokenPayload;

    return this.mediaService.uploadFile(file, 'image', currentUser);
  }

  @Post('upload-image-patient/:patientId')
  @UseInterceptors(FileInterceptor('file'))
  uploadImagePatient(
    @UploadedFile() file: Express.Multer.File,
    @Param('patientId') patientId: string,
  ) {
    console.log("currentUserRaw:", patientId);

    return this.mediaService.uploadAvatarPatient(file, 'image', patientId);
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

  @Post('update-avatar/:patientId')
  @UseInterceptors(FileInterceptor('file'))
  async updateAvatarPatient(
    @Param('patientId') patientId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.mediaService.updateAvatarPatient(patientId, file);
  }

  @Post('delete/:id')
  async deleteFile(
    @Param('id') id: string,
    @Headers('x-current-user') currentUserRaw: string,
  ) {
    console.log(currentUserRaw);
    const currentUser = JSON.parse(currentUserRaw) as TokenPayload;

    return this.mediaService.deleteFile(id, currentUser);
  }

  @Post('delete-multiple')
  async deleteMultipleFile(
    @Body() body: { ids: string[] },
    @Headers('x-current-user') currentUserRaw: string,
  ) {
    const currentUser = JSON.parse(currentUserRaw) as TokenPayload;

    return this.mediaService.deleteMultipleFiles(body.ids, currentUser);
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
