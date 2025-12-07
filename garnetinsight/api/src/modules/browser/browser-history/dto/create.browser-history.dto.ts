import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { BrowserHistoryMode } from 'src/common/constants';
import { ScanFilter } from './get.browser-history.dto';

export class CreateBrowserHistoryDto {
  @ApiProperty({
    description: 'Filters for scan operation',
    type: () => ScanFilter,
    default: new ScanFilter(),
  })
  @IsOptional()
  @Type(() => ScanFilter)
  filter: ScanFilter = new ScanFilter();

  @ApiProperty({
    description: 'Search mode',
    type: String,
    example: BrowserHistoryMode.Pattern,
  })
  @IsOptional()
  @IsEnum(BrowserHistoryMode, {
    message: `mode must be a valid enum value. Valid values: ${Object.values(
      BrowserHistoryMode,
    )}.`,
  })
  mode?: BrowserHistoryMode = BrowserHistoryMode.Pattern;
}
