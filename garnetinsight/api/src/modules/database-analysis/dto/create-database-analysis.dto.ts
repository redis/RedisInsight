import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { ScanFilter } from 'src/modules/database-analysis/models/scan-filter';
import { Type } from 'class-transformer';

export class CreateDatabaseAnalysisDto {
  @ApiProperty({
    description: 'Namespace delimiter',
    type: String,
    default: ':',
  })
  @IsOptional()
  @IsString()
  delimiter: string = ':';

  @ApiProperty({
    description: 'Filters for scan operation',
    type: () => ScanFilter,
    default: new ScanFilter(),
  })
  @IsOptional()
  @Type(() => ScanFilter)
  filter: ScanFilter = new ScanFilter();
}
