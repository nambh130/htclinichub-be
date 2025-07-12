import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Authorizations } from './authorization.decorator';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<{
      roles?: string[];
      permissions?: string[];
    }>(Authorizations, [context.getHandler(), context.getClass()]);

    if (!required) return true; // No roles/permissions required

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    console.log('test user: ', user);

    if (!user) throw new ForbiddenException('User not authenticated');

    const hasRole =
      !required.roles?.length ||
      required.roles.some((role) => user.roles?.includes(role));

    const hasPermission =
      !required.permissions?.length ||
      required.permissions.some((perm) => user.permissions?.includes(perm));

    if (!hasRole || !hasPermission) {
      throw new ForbiddenException('Access denied');
    }

    return true;
  }
}
