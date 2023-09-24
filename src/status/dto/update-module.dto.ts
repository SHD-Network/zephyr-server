import { ApiProperty } from '@nestjs/swagger';

export class UpdateModuleDto {
  @ApiProperty()
  module: string;

  @ApiProperty()
  status: boolean;
}
