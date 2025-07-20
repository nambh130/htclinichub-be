// apps/chat-service/src/schemas/conversation.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Mongoose document type for Conversation
 */
export type ConversationDocument = Conversation & Document;

/**
 * Conversation Schema - represents a chat room with multiple participants.
 */
@Schema({ timestamps: true })
export class Conversation {
  /**
   * Array of user IDs who are participants in this conversation.
   */
  @Prop({ type: [String], required: true })
  participants: string[];
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
