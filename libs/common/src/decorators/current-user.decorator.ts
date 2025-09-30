import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { ActorType } from '@app/common';

export interface TokenPayload {
  userId: string;
  email?: string;
  actorType: ActorType;
  roles?: string[];
  permissions?: string[];
  isAdmin?: string;
  currentClinics?: string[];
  adminOf?: string[];
}
// Extend the Express Request interface to include the user property
interface RequestWithUser extends Request {
  user: TokenPayload;
}

const getCurrentUserByContext = (context: ExecutionContext): TokenPayload => {
  const request = context.switchToHttp().getRequest<RequestWithUser>();
  return request.user;
};

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) =>
    getCurrentUserByContext(context),
);
