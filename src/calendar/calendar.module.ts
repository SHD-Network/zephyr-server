import { Module } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CalendarController } from './calendar.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthService } from '../auth/auth.service';

@Module({
  controllers: [CalendarController],
  providers: [CalendarService, AuthService],
  imports: [PrismaModule],
})
export class CalendarModule {}
