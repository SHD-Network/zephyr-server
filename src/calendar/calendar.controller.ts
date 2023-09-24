import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { Request } from 'express';
import { AuthService } from '../auth/auth.service';
import { CreateCalendarDto } from './dto/create-calendar.dto';

@Controller({
  path: 'api/calendar',
  version: '1',
})
export class CalendarController {
  constructor(
    private readonly calendarService: CalendarService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  async listCalendars(@Req() req: Request) {
    const sessionId = req.session;
    const user = await this.authService.getUserFromSession(sessionId);

    return this.calendarService.listCalendars(user);
  }

  @Get(':calendarId')
  async getCalendar(@Req() req: Request) {
    const sessionId = req.session;
    const user = await this.authService.getUserFromSession(sessionId);

    return this.calendarService.getCalendar(user, req.params.calendarId);
  }

  @Post()
  async createCalendar(
    @Req() req: Request,
    @Body() createCalendarDto: CreateCalendarDto,
  ) {
    const sessionId = req.session;
    const user = await this.authService.getUserFromSession(sessionId);

    return this.calendarService.createCalendar(user, createCalendarDto);
  }
}
