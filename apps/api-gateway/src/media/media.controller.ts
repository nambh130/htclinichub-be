import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { Express } from 'express';
import { CurrentUser, JwtAuthGuard, MediaDto, TokenPayload } from '@app/common';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get('get/:id')
  @UseGuards(JwtAuthGuard)
  getFileById(@Param('id') id: string): Promise<unknown> {
    return this.mediaService.getFileById(id);
  }

  @Get('get-avatar-patient/:patientId')
  @UseGuards(JwtAuthGuard)
  getAvatarPatient(@Param('patientId') patientId: string): Promise<unknown> {
    return this.mediaService.getAvatarPatient(patientId);
  }

  @Post('upload-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() currentUser: TokenPayload,
  ): Promise<MediaDto> {
    return this.mediaService.uploadSingleFile(
      'upload-image',
      file,
      currentUser,
    );
  }

  @Post('upload-image-patient/:patientId')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  uploadImagePatient(
    @UploadedFile() file: Express.Multer.File,
    @Param('patientId') patientId: string,
  ): Promise<MediaDto> {
    return this.mediaService.uploadAvatarPatient(
      'upload-image-patient',
      file,
      patientId,
    );
  }

  @Post('upload-images')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 3))
  uploadImages(
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() currentUser: TokenPayload,
  ): Promise<MediaDto[]> {
    return this.mediaService.uploadMultipleFiles(
      'upload-images',
      files,
      currentUser,
    );
  }

  @Post('upload-pdf')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  uploadPdf(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() currentUser: TokenPayload,
  ): Promise<MediaDto> {
    return this.mediaService.uploadSingleFile('upload-pdf', file, currentUser);
  }

  @Post('upload-pdfs')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 3))
  uploadPdfs(
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() currentUser: TokenPayload,
  ): Promise<MediaDto[]> {
    return this.mediaService.uploadMultipleFiles(
      'upload-pdfs',
      files,
      currentUser,
    );
  }

  @Post('upload-document')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() currentUser: TokenPayload,
  ): Promise<MediaDto> {
    return this.mediaService.uploadSingleFile(
      'upload-document',
      file,
      currentUser,
    );
  }

  @Post('upload-documents')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 3))
  uploadDocuments(
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() currentUser: TokenPayload,
  ): Promise<MediaDto[]> {
    return this.mediaService.uploadMultipleFiles(
      'upload-documents',
      files,
      currentUser,
    );
  }

  @Post('update/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async replaceFile(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    return this.mediaService.replaceFile(id, file, currentUser);
  }

  @Delete('delete/:id')
  @UseGuards(JwtAuthGuard)
  async deleteFile(
    @Param('id') id: string,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    return this.mediaService.deleteFile(id, currentUser);
  }

  @Post('update-avatar/:patientId')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async updateAvatarPatient(
    @Param('patientId') patientId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() currentUser: TokenPayload,
  ) {
    return this.mediaService.updateAvatarPatient(patientId, file);
  }
}
