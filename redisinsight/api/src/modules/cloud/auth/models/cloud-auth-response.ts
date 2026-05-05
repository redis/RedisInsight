import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum CloudAuthStatus {
  Succeed = 'succeed',
  Failed = 'failed',
}

export class CloudAuthResponse {
  @ApiProperty({
    description: 'Authentication status',
    enum: CloudAuthStatus,
    example: CloudAuthStatus.Succeed,
  })
  status: CloudAuthStatus;

  @ApiPropertyOptional({
    description: 'Success or informational message',
    type: String,
    example: 'Successfully authenticated',
  })
  message?: string;

  @ApiPropertyOptional({
    description: 'Error details if authentication failed',
    oneOf: [
      { type: 'object' },
      { type: 'string' },
    ],
    example: { code: 'OAUTH_ERROR', message: 'Authentication failed' },
  })
  error?: object | string;
}
