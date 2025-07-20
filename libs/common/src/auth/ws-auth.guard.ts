// libs/common/src/guards/ws-auth.guard.ts (placed in shared library)
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Socket } from 'socket.io';
import { ClientProxy } from '@nestjs/microservices'; // Used to communicate with Auth Microservice

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(
    // Inject ClientProxy to send requests to the Auth Microservice
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Extract the socket client from WebSocket execution context
    const client: Socket = context.switchToWs().getClient<Socket>();

    // Retrieve token from the socket handshake authentication payload
    const token = client.handshake.auth.token;

    if (!token) {
      // Reject connection if no token is provided
      return false;
    }

    try {
      // Send the token to the Auth Microservice for validation
      const user = await this.authClient
        .send('validate_token', { token })
        .toPromise();

      if (!user) return false;

      // Attach user info to the socket instance for later usage in handlers
      (client as any).user = user;
      return true;
    } catch (e) {
      // In case of any error during validation, deny access
      return false;
    }
  }
}
