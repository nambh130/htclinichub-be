import { FileCategory } from '@app/common';
import { IsEnum, IsOptional, IsString, IsUrl, IsNumber } from 'class-validator';

export class MediaDto {
  @IsString()
  readonly _id: string;

  @IsString()
  readonly publicId: string;

  @IsString()
  readonly name: string;

  @IsEnum(['image', 'pdf', 'document', 'other'])
  readonly type: FileCategory;

  @IsUrl()
  readonly url: string;

  @IsString()
  readonly domain: string;

  @IsOptional()
  @IsString()
  readonly mimetype?: string;

  @IsOptional()
  @IsString()
  readonly originalName?: string;

  @IsOptional()
  @IsNumber()
  readonly size?: number;
}
