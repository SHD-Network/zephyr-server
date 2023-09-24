import { Injectable } from '@nestjs/common';
import { Messages } from '@prisma/client';
import { PrismaService } from '@zephyr/prisma/prisma.service';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  async listMessages(sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: {
        id: sessionId,
      },
    });

    const userId = session.userId;

    const groupChats = await this.prisma.groupChats.findMany({
      where: {
        members: {
          some: {
            id: userId,
          },
        },
      },
      orderBy: [
        {
          updatedAt: 'desc',
        },
      ],
    });

    const sentMessages = await this.prisma.messages.findMany({
      where: {
        senderId: userId,
      },
      distinct: ['recipientId'],
      orderBy: [
        {
          updatedAt: 'desc',
        },
      ],
    });

    const receivedMessages = await this.prisma.messages.findMany({
      where: {
        recipientId: userId,
      },
      distinct: ['senderId'],
      orderBy: [
        {
          updatedAt: 'desc',
        },
      ],
    });

    const combinedMessages: Messages[] = [...sentMessages];

    for (let i = 0; i < receivedMessages.length; i++) {
      const senderId = receivedMessages[i].senderId;

      if (
        combinedMessages.findIndex((msg) => msg.recipientId === senderId) > -1
      ) {
        continue;
      }

      combinedMessages.push(receivedMessages[i]);
    }

    combinedMessages.sort((a, b) => {
      if (a.updatedAt > b.updatedAt) {
        return -1;
      }

      if (a.updatedAt < b.updatedAt) {
        return 1;
      }

      return 0;
    });

    return {
      groups: groupChats,
      chats: combinedMessages,
    };
  }

  async findUser(username: string, sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: {
        id: sessionId,
      },
    });

    const userId = session.userId;

    const users = await this.prisma.user.findMany({
      where: {
        username: {
          contains: username,
          mode: 'insensitive',
        },
        NOT: {
          id: {
            equals: userId,
          },
        },
      },
      select: {
        id: true,
        username: true,
        name: true,
        publicKey: {
          select: {
            keyValue: true,
          },
        },
      },
    });

    return {
      users,
    };
  }
}
