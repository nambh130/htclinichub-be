import { Type } from "class-transformer";
import { IsMongoId, IsOptional, IsString, Length } from "class-validator";

class FileObjectDto {
  @IsString()
  @Length(1, 100) // min length 1, max length 100
  id: string;

  @IsString()
  @Length(1, 255) // typical max URL length limit
  url: string;

  @IsString()
  @Length(1, 150) // max file name length
  name: string;
}

export class AddUploadedFileDto {
  @IsMongoId()
  orderItemId: string;

  @IsOptional()
  @Type(() => FileObjectDto)
  uploadedResult: FileObjectDto;
}
