import { PartialType } from '@nestjs/mapped-types';
import { CreateImagingTestDto } from './create-imaging-test.dto';

export class UpdateImagingTestDto extends PartialType(CreateImagingTestDto) {
  template?: any
}
