import type { PublicKeyCredentialWithAssertionJSON } from '@github/webauthn-json';
import { ApiProperty } from '@nestjs/swagger';

export class SigninUserPasskeyDto {
  @ApiProperty()
  username: string;

  @ApiProperty()
  credential: PublicKeyCredentialWithAssertionJSON;

  @ApiProperty()
  challenge: string;
}

export class SigninUserPasswordDto {
  @ApiProperty()
  username: string;

  @ApiProperty()
  password: string;
}
