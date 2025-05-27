import { IsNotEmpty, IsString } from 'class-validator';

export class getUserDto {
  @IsString()
  @IsNotEmpty()
  _id: string;
}
