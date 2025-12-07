import { Expose } from 'class-transformer';
import { TransformGroup } from 'src/common/constants';

export class CloudUserAccount {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose({ groups: [TransformGroup.Secure] })
  capiKey?: string; // api_access_key

  @Expose({ groups: [TransformGroup.Secure] })
  capiSecret?: string;
}
