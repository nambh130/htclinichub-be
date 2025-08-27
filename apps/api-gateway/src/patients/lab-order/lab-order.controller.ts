import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { LabOrderService } from './lab-order.service';
import { Request } from 'express';
import { MediaService } from '@api-gateway/media/media.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { CurrentUser, JwtAuthGuard, TokenPayload } from '@app/common';
import { CreateImagingTestResultDto } from './dto/save-imaging-result.dto';

@Controller('lab-order')
export class LabOrderController {
  constructor(
    private readonly labOrderService: LabOrderService,
    private readonly mediaService: MediaService,
  ) {}

  @Post('/')
  createLabOrder(@Req() req: Request) {
    return this.labOrderService.createLabOrder(req);
  }

  @Get('/')
  getLabOrderByReportId(
    @Req() req: Request,
    @Query() query: Record<string, any>,
  ) {
    return this.labOrderService.getLabOrderByReportId(query, req);
  }

  @Get('item/:id')
  getOrderItemById(@Req() req: Request, @Param('id') id: string) {
    return this.labOrderService.getOrderItemById(req, id);
  }

  @Get('by-clinic')
  getLabOrderByClinicId(
    @Req() req: Request,
    @Query() query: Record<string, any>,
  ) {
    return this.labOrderService.getLabOrderByClinictId(query, req);
  }

  // controller.ts
  @Patch('item/:id/status')
  async updateOrderItemStatus(@Param('id') id: string, @Req() req: Request) {
    return this.labOrderService.updateOrderItemStatus(req, id);
  }

  @Get('/item/:id/quantitative-result')
  async getOrderItemQuantResult(@Req() req: Request, @Param('id') id: string) {
    return this.labOrderService.getOrderItemQuantResult(req, id);
  }

  @Get('/item/:id/imaging-result')
  async getOrderItemImagingResult(
    @Req() req: Request,
    @Param('id') id: string,
  ) {
    return this.labOrderService.getOrderItemImagingResult(req, id);
  }

  @Get('/:id/quantitative-result')
  async getManyQuantResultByOrderItems(
    @Req() req: Request,
    @Param('id') id: string,
  ) {
    return this.labOrderService.getManyQuantResultByOrderItems(req, id);
  }

  @Post('/item/quantitative-result')
  async saveQuantitativeResult(@Req() req: Request) {
    return this.labOrderService.saveQuantitativeResult(req);
  }

  @Post('/item/result-file/remove')
  async removeQuantitativeUploadedResult(@Req() req: Request) {
    return this.labOrderService.removeResultFile(req);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('resultFile'))
  @Post('/item/result-file/add')
  async updateQuantitativeUploadedResult(
    @Req() req: Request,
    @UploadedFile() resultFile: Express.Multer.File,
    @Body() body: { orderItemId: string },
    @CurrentUser() currentUser: TokenPayload,
  ) {
    const { orderItemId } = body;
    if (!resultFile) {
      throw new BadRequestException('No file uploaded');
    }

    const uploadResult = await this.mediaService.uploadSingleFile(
      'upload-pdf',
      resultFile,
      currentUser,
    );

    const payload = {
      orderItemId,
      uploadedResult: {
        id: uploadResult._id,
        url: uploadResult.url,
        name: uploadResult.originalName,
      },
    };

    return this.labOrderService.addResultFile(req, payload);
  }

  @Post('/item/imaging-result')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('imageFiles', 10))
  async saveImagingResult(
    @Req() req: Request,
    @UploadedFiles() imageFiles: Express.Multer.File[],
    @CurrentUser() currentUser: TokenPayload,
  ) {
    const { orderItemId, accept, description, conclusion, existingImages } =
      req.body;

    let parsedExistingImages: { id: string; url: string }[] = [];
    try {
      parsedExistingImages =
        typeof existingImages === 'string'
          ? JSON.parse(existingImages)
          : existingImages || [];
    } catch (e) {
      parsedExistingImages = [];
    }

    const payload: CreateImagingTestResultDto = {
      orderItemId,
      accept: accept === 'true',
      result: {
        description,
        conclusion,
        images: parsedExistingImages,
      },
    };

    let uploadedImageObjects: { id: string; url: string }[] = [];

    try {
      if (imageFiles.length > 0) {
        const uploadResult = await this.mediaService.uploadMultipleFiles(
          'upload-images',
          imageFiles,
          currentUser,
        );

        uploadedImageObjects = uploadResult.map((item) => ({
          id: item._id,
          url: item.url,
        }));

        payload.result.images = [
          ...payload.result.images,
          ...uploadedImageObjects,
        ];
      }

      return await this.labOrderService.saveImagingResult(req, payload);
    } catch (error) {
      // Clean up uploaded files in case of failure
      if (uploadedImageObjects.length > 0) {
        const uploadedImageIds = uploadedImageObjects.map((image) => image.id);
        this.mediaService.deleteMultipleFiles(uploadedImageIds, currentUser);
      }
      throw error;
    }
  }
}
