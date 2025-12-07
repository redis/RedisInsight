import { NspSummary } from 'src/modules/database-analysis/models/nsp-summary';
import { Key } from 'src/modules/database-analysis/models/key';
import { IsInt, IsOptional, Min } from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { SimpleSummary } from 'src/modules/database-analysis/models/simple-summary';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ScanFilter } from 'src/modules/database-analysis/models/scan-filter';
import { AnalysisProgress } from 'src/modules/database-analysis/models/analysis-progress';
import { SumGroup } from 'src/modules/database-analysis/models/sum-group';
import { Recommendation } from 'src/modules/database-analysis/models/recommendation';

export class DatabaseAnalysis {
  @ApiProperty({
    description: 'Analysis id',
    type: String,
    default: '76dd5654-814b-4e49-9c72-b236f50891f4',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Database id',
    type: String,
    default: '76dd5654-814b-4e49-9c72-b236f50891f4',
  })
  @Expose()
  databaseId: string;

  @ApiProperty({
    description: 'Filters for scan operation',
    type: () => ScanFilter,
  })
  @Expose()
  @Type(() => ScanFilter)
  filter: ScanFilter;

  @ApiProperty({
    description: 'Namespace delimiter',
    type: String,
    default: ':',
  })
  @Expose()
  delimiter: string;

  @ApiProperty({
    description: 'Analysis progress',
    type: () => AnalysisProgress,
  })
  @Expose()
  @Type(() => AnalysisProgress)
  progress: AnalysisProgress;

  @ApiProperty({
    description: 'Analysis created date (ISO string)',
    type: Date,
    default: '2022-09-16T06:29:20.000Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Total keys with details by types',
    type: () => SimpleSummary,
  })
  @Expose()
  @Type(() => SimpleSummary)
  totalKeys: SimpleSummary;

  @ApiProperty({
    description: 'Total memory with details by types',
    type: () => SimpleSummary,
  })
  @Expose()
  @Type(() => SimpleSummary)
  totalMemory: SimpleSummary;

  @ApiProperty({
    description: 'Top namespaces by keys number',
    type: () => NspSummary,
  })
  @Expose()
  @Type(() => NspSummary)
  topKeysNsp: NspSummary[];

  @ApiProperty({
    description: 'Top namespaces by memory',
    type: () => NspSummary,
  })
  @Expose()
  @Type(() => NspSummary)
  topMemoryNsp: NspSummary[];

  @ApiProperty({
    description:
      'Top keys by key length (string length, list elements count, etc.)',
    isArray: true,
    type: () => Key,
  })
  @Expose()
  @Type(() => Key)
  topKeysLength: Key[];

  @ApiProperty({
    description: 'Top keys by memory used',
    isArray: true,
    type: () => Key,
  })
  @Expose()
  @Type(() => Key)
  topKeysMemory: Key[];

  @ApiProperty({
    description: 'Expiration groups',
    isArray: true,
    type: () => SumGroup,
  })
  @Expose()
  @Type(() => SumGroup)
  expirationGroups: SumGroup[];

  @ApiProperty({
    description: 'Recommendations',
    isArray: true,
    type: () => Recommendation,
  })
  @Expose()
  @Type(() => Recommendation)
  recommendations: Recommendation[];

  @ApiPropertyOptional({
    description: 'Logical database number.',
    type: Number,
  })
  @Expose()
  @IsInt()
  @Min(0)
  @IsOptional()
  db?: number;
}
