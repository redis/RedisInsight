import { ApiPropertyOptional } from '@nestjs/swagger';

import { Expose, Type } from 'class-transformer';
import { CloudUserAccount } from 'src/modules/cloud/user/models/cloud-user-account';
import { TransformGroup } from 'src/common/constants';
import { CloudCapiKey } from 'src/modules/cloud/capi-key/model';

export class CloudUser {
  @Expose()
  @ApiPropertyOptional({
    description: 'User id',
    type: Number,
  })
  id?: number;

  @Expose()
  @ApiPropertyOptional({
    description: 'User name',
    type: String,
  })
  name?: string;

  @Expose()
  @ApiPropertyOptional({
    description: 'Current account id',
    type: Number,
  })
  currentAccountId?: number;

  @Type(() => CloudCapiKey)
  @Expose({ groups: [TransformGroup.Secure] })
  @ApiPropertyOptional({
    description: 'Cloud API key',
    type: CloudCapiKey,
  })
  capiKey?: CloudCapiKey;

  @Type(() => CloudUserAccount)
  @Expose()
  @ApiPropertyOptional({
    description: 'User accounts',
    type: CloudUserAccount,
    isArray: true,
  })
  accounts?: CloudUserAccount[] = [];

  @Expose()
  @ApiPropertyOptional({
    description: 'Additional user data',
    type: Object,
  })
  data?: Record<string, any>;
}
