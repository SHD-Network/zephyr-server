import { ApiProperty } from '@nestjs/swagger';

export class UpdateAccountSettingsDto {
  @ApiProperty()
  setting: string;

  @ApiProperty()
  value: boolean;
}
