import { PartialType, PickType } from '@nestjs/swagger';
import { DatabaseAnalysis } from 'src/modules/database-analysis/models/database-analysis';

export class ShortDatabaseAnalysis extends PartialType(
  PickType(DatabaseAnalysis, ['id', 'createdAt', 'db'] as const),
) {}
