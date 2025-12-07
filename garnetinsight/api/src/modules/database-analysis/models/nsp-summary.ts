import { NspTypeSummary } from 'src/modules/database-analysis/models/nsp-type-summary';
import { RedisString } from 'src/common/constants';
import { Expose, Type } from 'class-transformer';
import { RedisStringType } from 'src/common/decorators';
import { ApiProperty } from '@nestjs/swagger';

export class NspSummary {
  @ApiProperty({
    description: 'Namespace',
    type: String,
    example: 'device',
  })
  @RedisStringType()
  @Expose()
  nsp: RedisString;

  @ApiProperty({
    description: 'Total memory used by namespace in bytes',
    type: Number,
    example: 10_000_000,
  })
  @Expose()
  memory: number;

  @ApiProperty({
    description: 'Total keys inside namespace',
    type: Number,
    example: 10_000,
  })
  @Expose()
  keys: number;

  @ApiProperty({
    description: 'Top namespaces by keys number',
    isArray: true,
    type: () => NspTypeSummary,
  })
  @Expose()
  @Type(() => NspTypeSummary)
  types: NspTypeSummary[];
}
