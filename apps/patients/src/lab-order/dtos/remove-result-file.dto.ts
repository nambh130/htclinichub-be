import { IsMongoId, IsString } from "class-validator";

export class RemoveResultFileDto {
  @IsMongoId()
  orderItemId: string

  @IsString()
  resultFileId: string;
}

