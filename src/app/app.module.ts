import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { NestCrawlerModule } from 'nest-crawler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../user/user.module';
import { SetupModule } from '../setup/setup.module';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { StatusModule } from '../status/status.module';
import { MessageModule } from '../message/message.module';
import { ScheduleModule } from '@nestjs/schedule';
import { DefconModule } from '../defcon/defcon.module';
import { CalendarModule } from '../calendar/calendar.module';
import { SessionMiddleware } from '../session.middleware';

@Module({
  imports: [
    NestCrawlerModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    SetupModule,
    AuthModule,
    StatusModule,
    MessageModule,
    DefconModule,
    CalendarModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SessionMiddleware).forRoutes('*');
  }
}
