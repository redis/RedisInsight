import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsString, Matches } from 'class-validator';

// TOTP codes are 6 digits; reject anything else locally so a malformed value
// does not consume one of the user's server-side MFA attempts
const TOTP_CODE_PATTERN = /^\d{6}$/;

export class CloudUserMfaLoginDto {
  @ApiProperty({
    description: 'TOTP code from the authenticator app',
    type: String,
    example: '123456',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @Matches(TOTP_CODE_PATTERN, { message: 'code must be a 6-digit number' })
  code: string;
}
