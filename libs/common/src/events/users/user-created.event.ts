import { ActorType } from "apps/auth/src/clinic-users/models/clinic-user.entity";

export class UserCreatedEvent {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly userType: ActorType,
  ) {}

  toString() {
    return JSON.stringify({
      id: this.id,
      email: this.email,
      userType: this.userType,
    });
  }
}

