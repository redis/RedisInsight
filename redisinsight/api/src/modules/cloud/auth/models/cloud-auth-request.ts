import { ApiProperty, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { SessionMetadata } from 'src/common/models';
import { CloudAuthResponse } from './cloud-auth-response';

export enum CloudAuthIdpType {
  Google = 'google',
  GitHub = 'github',
  Sso = 'sso',
}

@ApiTags('Cloud Auth')
export class CloudAuthRequestOptions {
  @ApiProperty({
    description: 'OAuth identity provider strategy',
    enum: CloudAuthIdpType,
    example: CloudAuthIdpType.Google,
  })
  strategy: CloudAuthIdpType;

  @ApiPropertyOptional({
    description: 'Action to perform after authentication',
    type: String,
    example: 'signIn',
  })
  action?: string;

  @ApiPropertyOptional({
    description: 'Additional data for the authentication request',
    type: Object,
    example: { email: 'user@example.com' },
  })
  data?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Callback function to execute after authentication',
    type: Function,
  })
  callback?: (result: CloudAuthResponse) => Promise<any>;
}

export class CloudAuthRequest extends CloudAuthRequestOptions {
  @ApiProperty({
    description: 'Identity provider type',
    enum: CloudAuthIdpType,
    example: CloudAuthIdpType.Google,
  })
  idpType: CloudAuthIdpType;

  @ApiProperty({
    description: 'Session metadata',
    type: Object,
  })
  sessionMetadata: SessionMetadata;

  @ApiProperty({
    description: 'Creation timestamp of the auth request',
    type: Date,
  })
  createdAt: Date;

  @ApiProperty({
    description: 'OAuth state parameter for CSRF protection',
    type: String,
    example: 'state_p6vA6A5tF36Jf6twH2cBOtt7n',
  })
  state: string;
}
