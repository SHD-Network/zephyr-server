import type { PublicKeyCredentialWithAssertionJSON } from '@github/webauthn-json';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmIdentityDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  credential: PublicKeyCredentialWithAssertionJSON;

  @ApiProperty()
  challenge: string;
}
