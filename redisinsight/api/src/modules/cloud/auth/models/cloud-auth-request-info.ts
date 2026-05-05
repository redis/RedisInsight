import { PickType, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CloudAuthRequest, CloudAuthIdpType } from 'src/modules/cloud/auth/models/cloud-auth-request';
import { SessionMetadata } from 'src/common/models';

export class CloudAuthRequestInfo extends PickType(CloudAuthRequest, [
  'idpType',
  'action',
  'sessionMetadata',
] as const) {
  @ApiProperty({
    description: 'Identity provider type',
    enum: CloudAuthIdpType,
    example: CloudAuthIdpType.Google,
  })
  idpType: CloudAuthIdpType;

  @ApiPropertyOptional({
    description: 'Action to perform after authentication',
    type: String,
    example: 'signIn',
  })
  action?: string;

  @ApiProperty({
    description: 'Session metadata',
    type: Object,
  })
  sessionMetadata: SessionMetadata;
}
