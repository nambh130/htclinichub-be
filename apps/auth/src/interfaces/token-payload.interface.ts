import { ActorType } from "../clinic-users/models/clinic-user.entity";

export interface TokenPayload {
  userId: string,
  actorType: ActorType,
  roles?: string[],
  permissions?: string[],
  isAdmin?: boolean,
  currentClinics?: string
}
