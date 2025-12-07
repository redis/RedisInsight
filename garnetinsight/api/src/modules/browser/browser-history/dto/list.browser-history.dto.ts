import { IsEnum, IsOptional } from 'class-validator';
import { BrowserHistoryMode } from 'src/common/constants';

export class ListBrowserHistoryDto {
  @IsEnum(BrowserHistoryMode)
  @IsOptional()
  mode?: BrowserHistoryMode;
}
