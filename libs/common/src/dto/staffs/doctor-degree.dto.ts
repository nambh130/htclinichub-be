import { IsString, MaxLength } from 'class-validator';

export class DoctorDegreeDto {
  @IsString()
  @MaxLength(50)
  name: string;

  @IsString()
  @MaxLength(100)
  description: string;

  @IsString()
  image_id: string;
}
