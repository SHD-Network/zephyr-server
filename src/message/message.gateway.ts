import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '@zephyr/prisma/prisma.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'messages',
})
export class MessageGateway {
  constructor(private prisma: PrismaService) {}
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinRoom')
  async joinRoom(@ConnectedSocket() client: Socket) {
    const header = client.handshake.headers.cookie;
    if (header === undefined) {
      return;
    }

    const cookies = header.split('; ');
    const sessionCookie = cookies.find((c) => c.startsWith('zsn='));

    if (sessionCookie === undefined) {
      return;
    }

    const sessionId = header.split('=')[1];

    const user = await this.prisma.session.findUnique({
      select: {
        userId: true,
      },
      where: {
        id: sessionId,
      },
    });

    client.join(user.userId);
    console.log(`User ${client.id} joined room ${user.userId}`);
  }

  @SubscribeMessage('message')
  async onMessage(
    @MessageBody() body: { userId: string; message: string; sessionId: string },
  ) {
    const user = await this.prisma.session.findUnique({
      select: {
        userId: true,
      },
      where: {
        id: body.sessionId,
      },
    });

    console.log(`Sending message from ${user.userId} to ${body.userId}`);

    this.server.to(body.userId).emit('message', {
      message: body.message,
      from: user.userId,
    });
  }
}
