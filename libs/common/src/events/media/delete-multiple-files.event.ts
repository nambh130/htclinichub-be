import { TokenPayload } from "@app/common/decorators";

export class DeleteMultipleFilesEvent {
  public readonly ids: string[]
  public readonly currentUser: TokenPayload
  constructor(
    {
      ids,
      currentUser
    }: {
      ids: string[],
      currentUser: TokenPayload
    }
  ) {
    this.ids = ids,
      this.currentUser = currentUser
  }

  toString() {
    return JSON.stringify({
      ids: this.ids,
      currentUser: this.currentUser
    });
  }
}
