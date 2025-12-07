import { Expose, Type } from 'class-transformer';
import { CloudUserAccount } from 'src/modules/cloud/user/models/cloud-user-account';
import { TransformGroup } from 'src/common/constants';
import { CloudCapiKey } from 'src/modules/cloud/capi-key/model';

export class CloudUser {
  @Expose()
  id?: number;

  @Expose()
  name?: string;

  @Expose()
  currentAccountId?: number;

  @Type(() => CloudCapiKey)
  @Expose({ groups: [TransformGroup.Secure] })
  capiKey?: CloudCapiKey;

  @Type(() => CloudUserAccount)
  @Expose()
  accounts?: CloudUserAccount[] = [];

  @Expose()
  data?: Record<string, any>;
}
