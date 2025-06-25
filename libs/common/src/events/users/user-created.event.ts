import { ActorType } from '@app/common';

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
