// apps/chat-service/src/chat.controller.ts

import { Controller, Get, Param, Query } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('conversations')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * REST API to fetch message history for a specific chat room (conversation)
   * Supports pagination via the 'page' query parameter.
   */
  @Get(':id/messages')
  getMessages(
    @Param('id') roomId: string,
    @Query('page') page: number = 1,
  ) {
    return this.chatService.getMessageHistory(roomId, page);
  }
}
