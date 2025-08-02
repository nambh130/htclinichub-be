import { Controller } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { MediaService } from "./media.service";
import { DeleteMultipleFilesEvent } from "@app/common/events/media";

@Controller()
export class MediaEventController {
  constructor(private readonly mediaService: MediaService) { }
  @EventPattern('delete-multiple-files')
  async deleteMultipleFiles(
    @Payload() payload: DeleteMultipleFilesEvent
  ) {
    console.log('payload: ', payload)
    const deleteResult =
      this.mediaService.deleteMultipleFiles(payload.ids, payload.currentUser);
    console.log(deleteResult)
    return deleteResult
  }
}

