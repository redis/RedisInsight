import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { TransformGroup } from 'src/common/constants';

export class CloudUserAccount {
  @Expose()
  @ApiProperty({
    description: 'Account id',
    type: Number,
  })
  id: number;

  @Expose()
  @ApiProperty({
    description: 'Account name',
    type: String,
  })
  name: string;

  @Expose({ groups: [TransformGroup.Secure] })
  @ApiProperty({
    description: 'Cloud API key',
    type: String,
  })
  capiKey?: string; // api_access_key

  @Expose({ groups: [TransformGroup.Secure] })
  @ApiProperty({
    description: 'Cloud API secret',
    type: String,
  })
  capiSecret?: string;
}
