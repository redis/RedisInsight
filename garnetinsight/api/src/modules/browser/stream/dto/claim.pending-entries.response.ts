import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsDefined } from 'class-validator';
import { Type } from 'class-transformer';

export class ClaimPendingEntriesResponse {
  @ApiProperty({
    description: 'Entries IDs were affected by claim command',
    type: String,
    isArray: true,
    example: ['1650985323741-0', '1650985323770-0'],
  })
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => String)
  affected: string[];
}
