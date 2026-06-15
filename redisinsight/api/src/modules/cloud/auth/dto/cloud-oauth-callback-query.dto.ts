import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CloudOauthCallbackQueryDto {
  @ApiPropertyOptional({
    description: 'Authorization code from OAuth provider',
    type: String,
    example: 'abc123def456',
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({
    description: 'State parameter to prevent CSRF attacks',
    type: String,
    example: 'state_p6vA6A5tF36Jf6twH2cBOqtt7n',
  })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({
    description: 'Error code if OAuth flow failed',
    type: String,
    example: 'access_denied',
  })
  @IsOptional()
  @IsString()
  error?: string;

  @ApiPropertyOptional({
    description: 'Human-readable error description',
    type: String,
    example: 'The user denied the request',
  })
  @IsOptional()
  @IsString()
  error_description?: string;
}
