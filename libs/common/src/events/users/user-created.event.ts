import { UserType } from "@app/common/enum/user-type.enum";

export class UserCreatedEvent {
  constructor(
    public readonly id: number,
    public readonly email: string,
    public readonly userType: string,
  ) {}

  toString() {
    return JSON.stringify({
      id: this.id,
      email: this.email,
      userType: this.userType,
    });
  }
}

