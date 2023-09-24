import { Injectable } from '@nestjs/common';
import { PrismaService } from '@zephyr/prisma/prisma.service';
import { hashPassword } from '@zephyr/setup/setup.service';
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async fetchPublicKey(from: 'username' | 'id', value: string) {
    if (from === 'username') {
      const publicKey = await this.prisma.user.findUnique({
        where: {
          username: value,
        },
        select: {
          publicKey: {
            select: {
              keyValue: true,
            },
          },
        },
      });

      return {
        publicKey: publicKey.publicKey,
      };
    }

    const publicKey = await this.prisma.user.findUnique({
      where: {
        id: value,
      },
      select: {
        publicKey: {
          select: {
            keyValue: true,
          },
        },
      },
    });

    return {
      publicKey: publicKey.publicKey,
    };
  }

  async hasPassword(sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: {
        id: sessionId,
      },
    });
    const user = await this.prisma.user.findUnique({
      where: {
        id: session.userId,
      },
      select: {
        password: true,
      },
    });

    return user;
  }

  async hasPasskey(sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: {
        id: sessionId,
      },
    });
    const user = await this.prisma.user.findUnique({
      where: {
        id: session.userId,
      },
      select: {
        credentials: true,
      },
    });

    return user;
  }

  async addPassword(sessionId: string, password: string) {
    const session = await this.prisma.session.findUnique({
      where: {
        id: sessionId,
      },
    });
    const hashedPassword = await hashPassword(password);
    const user = await this.prisma.user.update({
      where: {
        id: session.userId,
      },
      data: {
        password: {
          create: {
            password: hashedPassword.password,
            salt: hashedPassword.salt,
          },
        },
      },
    });

    return {
      ...user,
    };
  }

  async getSessions(sessionId: string) {
    const currentSession = await this.prisma.session.findUnique({
      where: {
        id: sessionId,
      },
    });

    const allSessions = await this.prisma.session.findMany({
      where: {
        userId: currentSession.userId,
      },
    });

    return {
      currentSession,
      allSessions,
    };
  }

  async listAllUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        session: {
          select: {
            id: true,
            lastActive: true,
          },
        },
      },
    });
    return {
      users,
    };
  }

  async get(sessionId: string) {
    if (sessionId === undefined) {
      return;
    }

    const session = await this.prisma.session.findUnique({
      where: {
        id: sessionId,
      },
    });

    const user = await this.prisma.user.findUnique({
      where: {
        id: session.userId,
      },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    return {
      ...user,
    };
  }

  async getById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    return {
      ...user,
    };
  }
}
