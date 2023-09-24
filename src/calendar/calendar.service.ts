import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { CreateCalendarDto } from './dto/create-calendar.dto';

@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {}

  async getCalendar(user: User, calendarId: string) {
    const calendar = await this.prisma.calendar.findUnique({
      where: {
        id: calendarId,
        OR: [
          { ownerId: user.id },
          {
            calendarUserPermissions: { some: { userId: user.id, read: true } },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        owner: true,
        events: true,
        color: true,
        calendarUserPermissions: {
          select: {
            read: true,
            write: true,
          },
          where: {
            userId: user.id,
          },
        },
      },
    });

    if (calendar === null) {
      null;
    }

    return calendar;
  }

  async listCalendars(user: User) {
    const ownCalendars = await this.prisma.calendar.findMany({
      where: {
        ownerId: user.id,
      },
      select: {
        id: true,
        name: true,
        owner: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        events: true,
        color: true,
      },
    });

    const sharedPermissions =
      await this.prisma.calendarUserPermissions.findMany({
        where: {
          userId: user.id,
          read: true,
        },
      });

    const sharedCalendarIds = sharedPermissions.map((permission) => {
      return permission.calendarId;
    });

    const sharedCalendars = await this.prisma.calendar.findMany({
      where: {
        id: {
          in: sharedCalendarIds,
        },
      },
      select: {
        id: true,
        name: true,
        owner: true,
        events: true,
        color: true,
        calendarUserPermissions: {
          select: {
            read: true,
            write: true,
          },
          where: {
            userId: user.id,
          },
        },
      },
    });

    return {
      own: ownCalendars,
      shared: sharedCalendars,
    };
  }

  async createCalendar(user: User, data: CreateCalendarDto) {
    const calendar = await this.prisma.calendar.create({
      data: {
        name: data.name,
        ownerId: user.id,
        color: data.color,
      },
    });

    return calendar;
  }
}
