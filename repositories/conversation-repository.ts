import { prisma } from "@/lib/prisma-client";
import { Persona } from "@/validation/persona";

export class ConversationRepository {
  static async getConversations(userId: string) {
    return prisma.conversation.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  }

  static async createConversation(userId: string, persona: Persona, title?: string) {
    return prisma.conversation.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        persona,
        title: title || `Chat with ${persona === Persona.PIYUSH ? "Piyush Sir" : "Hitesh Sir"}`,
      },
    });
  }

  static async deleteConversation(userId: string, conversationId: string) {
    return prisma.conversation.deleteMany({
      where: {
        id: conversationId,
        userId,
      },
    });
  }

  static async getConversation(userId: string, conversationId: string) {
    return prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId,
      },
    });
  }

  static async getMessages(conversationId: string, roles?: string[], take?: number) {
    if (take !== undefined) {
      const messages = await prisma.message.findMany({
        where: {
          conversationId,
          ...(roles ? { role: { in: roles } } : {}),
        },
        orderBy: {
          createdAt: "desc",
        },
        take,
      });
      return messages.reverse();
    }

    return prisma.message.findMany({
      where: {
        conversationId,
        ...(roles ? { role: { in: roles } } : {}),
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  static async createMessage(conversationId: string, content: string, role: string) {
    return prisma.message.create({
      data: {
        id: crypto.randomUUID(),
        conversationId,
        content,
        role,
      },
    });
  }
}
