export class CreateEventDto {
  start: Date;
  end?: Date;
  allDay: boolean;
  name: string;
  description?: string;
}
