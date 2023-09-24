import type { PublicKeyCredentialWithAttestationJSON } from '@github/webauthn-json';
import { ApiProperty } from '@nestjs/swagger';

export class SignupUserPasskeyDto {
  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  credential: PublicKeyCredentialWithAttestationJSON;

  @ApiProperty()
  challenge: string;
}

export class SignupUserPasswordDto {
  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;
}

export class SignupUserAddKeysDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  bundle: string;
}
