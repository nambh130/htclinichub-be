// apps/chat-service/src/chat.service.ts

import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';
import { Message, MessageDocument } from './schemas/message.schema';

@Injectable()
export class ChatService {
  constructor(
    // Inject Conversation and Message models from Mongoose
    @InjectModel(Conversation.name)
    private conversationModel: Model<ConversationDocument>,
    
    @InjectModel(Message.name)
    private messageModel: Model<MessageDocument>,
  ) {}

  /**
   * Retrieves all chat room IDs that the user is a participant of.
   * @param userId - The ID of the user
   * @returns An array of chat room IDs (e.g., ['room_id_1', 'room_id_2'])
   */
  async getRoomsForUser(userId: string): Promise<string[]> {
    // 1. Find all conversations where the user is listed in the 'participants' array
    const conversations = await this.conversationModel.find({
      participants: userId,
    });

    // 2. If no conversations are found, return an empty array
    if (!conversations) {
      return [];
    }

    // 3. Map conversation documents to their stringified _id
    return conversations.map((convo) => convo._id.toString());
  }

  /**
   * Save a new message to a chat room.
   * Called by WebSocket Gateway upon receiving a message event.
   * @param user - The sender's user object (retrieved from WebSocket AuthGuard)
   * @param roomId - The ID of the conversation
   * @param content - The text content of the message
   * @returns The saved message payload to be broadcasted
   */
  async saveMessage(user: any, roomId: string, content: string): Promise<any> {
    const newMessage = new this.messageModel({
      conversationId: roomId,
      senderId: user.id,
      content: content,
    });

    await newMessage.save();

    return {
      sender: user, // User object already validated and injected by AuthGuard
      content: newMessage.content,
      timestamp: newMessage.createdAt, // Timestamp assigned by MongoDB
    };
  }

  /**
   * Retrieve paginated message history for a given chat room.
   * Sorted from oldest to newest for proper display.
   * @param roomId - ID of the conversation
   * @param page - Pagination page number (default: 1)
   * @param limit - Number of messages per page (default: 20)
   * @returns An array of messages
   */
  async getMessageHistory(roomId: string, page: number = 1, limit: number = 20): Promise<any[]> {
    const messages = await this.messageModel
      .find({ conversationId: roomId })
      .sort({ createdAt: -1 }) // Sort by newest messages first
      .skip((page - 1) * limit) // Skip messages based on the current page
      .limit(limit) // Limit the number of messages returned
      .exec();

    // TODO: Optionally populate senderId with user info if needed
    // e.g., .populate('senderId', 'name avatar') if using Mongoose ref

    return messages.reverse(); // Reverse to chronological order (oldest → newest)
  }
}
