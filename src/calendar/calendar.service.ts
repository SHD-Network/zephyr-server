import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { CreateEventDto } from './dto/create-event.dto';

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

  async listEvents(
    user: User,
    calendarIds: string[],
    startDate: Date,
    endDate: Date,
  ) {
    const ownCalendars = await this.prisma.calendar.findMany({
      where: {
        ownerId: user.id,
        id: {
          in: calendarIds,
        },
      },
      select: {
        events: {
          where: {
            OR: [
              {
                start: {
                  gte: startDate,
                },
              },
              {
                end: {
                  lte: endDate,
                },
              },
            ],
          },
        },
      },
    });

    const sharedPermissions =
      await this.prisma.calendarUserPermissions.findMany({
        where: {
          userId: user.id,
          read: true,
          calendarId: {
            in: calendarIds,
          },
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
        events: {
          where: {
            OR: [
              {
                start: {
                  gte: startDate,
                },
              },
              {
                end: {
                  lte: endDate,
                },
              },
            ],
          },
        },
      },
    });

    return {
      own: ownCalendars,
      shared: sharedCalendars,
    };
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
        events: false,
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
        events: false,
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

  async createEvent(calendarId: string, user: User, data: CreateEventDto) {
    const event = await this.prisma.calendarEvent.create({
      data: {
        name: data.name,
        description: data.description,
        calendarId,
        start: data.start,
        end: data.end,
        allDay: data.allDay,
        createdById: user.id,
      },
    });

    return event;
  }

  async listSelectedCalendars(user: User) {
    const config = await this.prisma.userConfig.findFirst({
      where: {
        userId: user.id,
        key: 'selectedCalendars',
      },
      select: {
        id: true,
        value: true,
      },
    });

    if (config === null) {
      return {
        id: null,
        value: {
          calendarIds: [],
        },
      };
    }

    return config;
  }

  async updateSelectedCalendars(
    user: User,
    configId: string,
    calendarIds: string[],
  ) {
    const config = await this.prisma.userConfig.upsert({
      where: {
        id: configId === null ? '' : configId,
      },
      update: {
        value: {
          calendarIds,
        },
      },
      create: {
        userId: user.id,
        key: 'selectedCalendars',
        value: {
          calendarIds,
        },
      },
    });

    return config;
  }
}
