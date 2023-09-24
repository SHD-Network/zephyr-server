import { Module } from '@nestjs/common';
import { MessageGateway } from './message.gateway';
import { PrismaModule } from '@zephyr/prisma/prisma.module';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';

@Module({
  controllers: [MessageController],
  providers: [MessageGateway, MessageService],
  imports: [PrismaModule],
})
export class MessageModule {}
