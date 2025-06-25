import { Reflector } from '@nestjs/core';

export const Authorizations = Reflector.createDecorator<{roles?: string[], permissions?: string[]}>();
