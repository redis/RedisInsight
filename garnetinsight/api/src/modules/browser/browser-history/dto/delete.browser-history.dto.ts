import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsDefined } from 'class-validator';
import { Type } from 'class-transformer';

export class DeleteBrowserHistoryItemsDto {
  @ApiProperty({
    description: 'The unique ID of the browser history requested',
    type: String,
    isArray: true,
  })
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => String)
  ids: string[];
}
