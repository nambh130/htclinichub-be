import { ActorType } from '@app/common';

export interface TokenPayload {
  userId: string;
  actorType: ActorType;
  roles?: string[];
  permissions?: string[];
  isAdminOf?: string[];
  //isAdmin?: boolean,
  currentClinics?: string[];
}
