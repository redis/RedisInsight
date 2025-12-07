import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { BrowserHistoryMode } from 'src/common/constants';

export class DeleteBrowserHistoryQueryDto {
  @ApiProperty({
    description: 'Search mode',
    type: String,
    example: BrowserHistoryMode.Pattern,
  })
  @IsEnum(BrowserHistoryMode, {
    message: `mode must be a valid enum value. Valid values: ${Object.values(
      BrowserHistoryMode,
    )}.`,
  })
  mode: BrowserHistoryMode = BrowserHistoryMode.Pattern;
}
