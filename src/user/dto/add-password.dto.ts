import { ApiProperty } from '@nestjs/swagger';

export class AddPasswordDto {
  @ApiProperty()
  password: string;
}
