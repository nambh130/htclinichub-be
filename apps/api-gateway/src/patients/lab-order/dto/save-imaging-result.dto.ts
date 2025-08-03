import {
  IsOptional,
  IsString,
  ValidateNested,
  IsArray,
  IsObject,
  IsMongoId,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

class FileObjectDto {
  @IsString()
  id: string;

  @IsString()
  url: string;
}

class ImagingResultDataDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  conclusion?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileObjectDto)
  images?: FileObjectDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileObjectDto)
  dicoms?: FileObjectDto[];
}

export class CreateImagingTestResultDto {
  @IsMongoId()
  orderItemId: string;

  @IsObject()
  @ValidateNested()
  @Type(() => ImagingResultDataDto)
  result: ImagingResultDataDto;

  @IsBoolean()
  @IsOptional()
  accept?: boolean
}
