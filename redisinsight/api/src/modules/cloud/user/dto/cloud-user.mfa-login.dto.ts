import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CloudUserMfaLoginDto {
  @ApiProperty({
    description: 'TOTP code from the authenticator app',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  code: string;
}
