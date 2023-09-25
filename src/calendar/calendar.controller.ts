import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { Request } from 'express';
import { AuthService } from '../auth/auth.service';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { ListEventsDto } from './dto/list-events.dto';
import { UpdateSelectedCalendarsDto } from './dto/update-selected-calendars.dto';

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

  @Post('events')
  async listEvents(@Req() req: Request, @Body() listEventsDto: ListEventsDto) {
    const sessionId = req.session;
    const user = await this.authService.getUserFromSession(sessionId);

    return this.calendarService.listEvents(
      user,
      listEventsDto.calendarIds.split(','),
      listEventsDto.startDate,
      listEventsDto.endDate,
    );
  }

  @Get('selected')
  async listSelectedCalendars(@Req() req: Request) {
    const sessionId = req.session;
    const user = await this.authService.getUserFromSession(sessionId);

    return this.calendarService.listSelectedCalendars(user);
  }

  @Post('selected')
  async updateSelectedCalendars(
    @Req() req: Request,
    @Body() updateSelectedCalendarsDto: UpdateSelectedCalendarsDto,
  ) {
    const sessionId = req.session;
    const user = await this.authService.getUserFromSession(sessionId);

    return this.calendarService.updateSelectedCalendars(
      user,
      updateSelectedCalendarsDto.configId,
      updateSelectedCalendarsDto.calendarIds === ''
        ? []
        : updateSelectedCalendarsDto.calendarIds.split(','),
    );
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

  @Post(':calendarId/event')
  async createEvent(
    @Req() req: Request,
    @Body() createEventDto: CreateEventDto,
  ) {
    const sessionId = req.session;
    const user = await this.authService.getUserFromSession(sessionId);

    return this.calendarService.createEvent(
      req.params.calendarId,
      user,
      createEventDto,
    );
  }
}
