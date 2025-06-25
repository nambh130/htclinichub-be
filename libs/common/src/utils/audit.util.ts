import { ActorType } from '../databases';

export function applyAuditFields<T extends object>(
  entity: T,
  user: { id: string; type: ActorType },
): T {
  return Object.assign(entity, {
    createdById: user.id,
    createdByType: user.type,
    updatedById: user.id,
    updatedByType: user.type,
  });
}

export function updateAuditFields<T extends object>(
  entity: T,
  user: { id: string; type: ActorType },
): T {
  return Object.assign(entity, {
    updatedById: user.id,
    updatedByType: user.type,
  });
}
