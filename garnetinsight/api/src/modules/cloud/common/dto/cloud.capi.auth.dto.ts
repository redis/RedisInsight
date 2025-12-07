import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsString } from 'class-validator';
import { ICloudCapiCredentials } from 'src/modules/cloud/common/models';

export class CloudCapiAuthDto implements ICloudCapiCredentials {
  @ApiProperty({
    description: 'Cloud API account key',
    type: String,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString({ always: true })
  capiKey: string;

  @ApiProperty({
    description: 'Cloud API secret key',
    type: String,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString({ always: true })
  capiSecret: string;
}
