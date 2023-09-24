import type { PublicKeyCredentialWithAssertionJSON } from '@github/webauthn-json';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyUserPasskeyDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  credential: PublicKeyCredentialWithAssertionJSON;

  @ApiProperty()
  challenge: string;
}
