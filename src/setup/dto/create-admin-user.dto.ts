import type { PublicKeyCredentialWithAttestationJSON } from '@github/webauthn-json';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAdminUserPasskeyDto {
  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  credential: PublicKeyCredentialWithAttestationJSON;

  @ApiProperty()
  challenge: string;
}

export class CreateAdminUserPasswordDto {
  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;
}

export class CreateAdminUserAddKeysDto {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  bundle: string;
}
