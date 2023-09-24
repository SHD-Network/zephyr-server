import { Module } from '@nestjs/common';
import { DefconService } from './defcon.service';
import { DefconController } from './defcon.controller';
import { NestCrawlerModule } from 'nest-crawler';
import { PrismaModule } from '@zephyr/prisma/prisma.module';

@Module({
  controllers: [DefconController],
  providers: [DefconService],
  imports: [NestCrawlerModule, PrismaModule],
})
export class DefconModule {}
