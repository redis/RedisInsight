import { KeyResponse } from 'src/modules/browser/keys/dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { StreamEntryDto } from './stream-entry.dto';

export class GetStreamEntriesResponse extends KeyResponse {
  @ApiProperty({
    type: Number,
    description: 'Total number of entries',
  })
  total: number;

  @ApiProperty({
    type: String,
    description: 'Last generated id in the stream',
  })
  lastGeneratedId: string;

  @ApiProperty({
    description: 'First stream entry',
    type: StreamEntryDto,
  })
  @Type(() => StreamEntryDto)
  firstEntry: StreamEntryDto;

  @ApiProperty({
    description: 'Last stream entry',
    type: StreamEntryDto,
  })
  @Type(() => StreamEntryDto)
  lastEntry: StreamEntryDto;

  @ApiProperty({
    description: 'Stream entries',
    type: StreamEntryDto,
    isArray: true,
  })
  @Type(() => StreamEntryDto)
  entries: StreamEntryDto[];
}
