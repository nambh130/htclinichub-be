// apps/chat-service/src/chat.gateway.ts

import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';

import { WsAuthGuard } from 'libs/common/src/auth/ws-auth.guard'; 
import { ChatService } from './chat.service'; 

@UseGuards(WsAuthGuard) // Apply WebSocket authentication guard globally to all handlers
@WebSocketGateway({
  cors: { origin: '*' }, // Allow any origin (adjust for production)
  namespace: '/chat',    // Define a custom namespace for chat sockets
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  /**
   * Inject the underlying Socket.IO server instance
   * Used to emit/broadcast messages to rooms or clients
   */
  @WebSocketServer()
  server: Server;

  /**
   * Inject ChatService to handle chat logic (persistence, fetching rooms, etc.)
   */
  constructor(private readonly chatService: ChatService) {}

  /**
   * Handle a new WebSocket connection.
   * Join the user to all rooms (conversations) they are a participant of.
   */
  async handleConnection(client: Socket, ...args: any[]) {
    const user = (client as any).user; // Set by WsAuthGuard

    console.log(`Client connected: ${client.id}, user: ${user.id}`);

    // Retrieve chat room IDs that the user belongs to
    const rooms = await this.chatService.getRoomsForUser(user.id);

    // Join the user to each room
    client.join(rooms);

    console.log(`User ${user.id} joined rooms:`, rooms);
  }

  /**
   * Handle socket disconnection event
   */
  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Handle the 'sendMessage' event from the client
   * Broadcasts the new message to all participants in the room
   */
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { roomId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = (client as any).user; // Retrieved from the guard

    // Persist message using the ChatService
    const newMessage = await this.chatService.saveMessage(user, data.roomId, data.content);

    // Emit the new message to all clients in the room
    this.server.to(data.roomId).emit('newMessage', newMessage);
  }
}
