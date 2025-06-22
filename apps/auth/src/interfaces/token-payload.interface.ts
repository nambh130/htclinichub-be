import { ActorType } from "../clinic-users/models/clinic-user.entity";

export interface TokenPayload {
  userId: string,
  actorType: ActorType,
  roles?: string[],
  permissions?: string[],
  isAdminOf?: string[],
  //isAdmin?: boolean,
  currentClinics?: string[]
}
