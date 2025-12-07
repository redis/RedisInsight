import { OmitType } from '@nestjs/swagger';
import { CreateDatabaseDto } from 'src/modules/database/dto/create.database.dto';

export class DiscoverSentinelMastersDto extends OmitType(CreateDatabaseDto, [
  'name',
  'db',
] as const) {}
