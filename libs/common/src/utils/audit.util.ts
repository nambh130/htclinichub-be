import { ActorType } from '@app/common';

export function setAudit<T extends object>(
  entity: T,
  user: { userId: string; actorType: ActorType },
): T {
  return Object.assign(entity, {
    createdById: user.userId,
    createdByType: user.actorType,
    createdAt: new Date(),
    updatedById: user.userId,
    updatedByType: user.actorType,
    updatedAt: new Date(),
  });
}

export function updateAudit<T extends object>(
  entity: T,
  user: { userId: string; actorType: ActorType },
): T {
  return Object.assign(entity, {
    updatedById: user.userId,
    updatedByType: user.actorType,
    updatedAt: new Date(),
  });
}

export function deleteAudit<T extends object>(
  entity: T,
  user: { userId: string; actorType: ActorType },
): T {
  return Object.assign(entity, {
    deletedAt: new Date(),
    deletedById: user.userId,
    deletedByType: user.actorType,
    ...(Object.prototype.hasOwnProperty.call(entity, 'isDeleted') && {
      isDeleted: true,
    }),
  }) as T;
}
