import { PickType } from '@nestjs/swagger';
import { CloudAuthRequest } from 'src/modules/cloud/auth/models/cloud-auth-request';

export class CloudAuthRequestInfo extends PickType(CloudAuthRequest, [
  'idpType',
  'action',
  'sessionMetadata',
] as const) {}
