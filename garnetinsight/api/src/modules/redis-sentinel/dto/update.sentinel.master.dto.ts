import { PickType } from '@nestjs/swagger';
import { SentinelMaster } from 'src/modules/redis-sentinel/models/sentinel-master';

export class UpdateSentinelMasterDto extends PickType(SentinelMaster, [
  'username',
  'password',
] as const) {}
