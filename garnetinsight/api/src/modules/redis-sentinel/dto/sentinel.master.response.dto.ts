import { ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { SentinelMaster } from 'src/modules/redis-sentinel/models/sentinel-master';
import { Expose } from 'class-transformer';
import { HiddenField } from 'src/common/decorators/hidden-field.decorator';

export class SentinelMasterResponse extends OmitType(SentinelMaster, [
  'password',
] as const) {
  @ApiPropertyOptional({
    description:
      'The password for your Redis Sentinel master. ' +
      'If your master doesn’t require a password, leave this field empty.',
    type: Boolean,
  })
  @Expose()
  @HiddenField(true)
  password?: boolean;
}
