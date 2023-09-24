import { ApiProperty } from '@nestjs/swagger';

export class ConfirmUserDto {
  @ApiProperty()
  sessionId: string;
}
