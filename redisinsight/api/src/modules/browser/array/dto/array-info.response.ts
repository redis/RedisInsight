import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { KeyResponse } from 'src/modules/browser/keys/dto';

export class ArrayInfoResponse extends KeyResponse {
  @ApiProperty({
    type: Number,
    description: 'The number of populated elements in the array.',
  })
  count: number;

  @ApiProperty({
    type: String,
    description: 'The logical array length (highest index + 1).',
  })
  len: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Index ARINSERT would use next.',
  })
  nextInsertIndex?: string;

  @ApiPropertyOptional({ type: Number })
  slices?: number;

  @ApiPropertyOptional({ type: Number })
  directorySize?: number;

  @ApiPropertyOptional({ type: Number })
  superDirEntries?: number;

  @ApiPropertyOptional({ type: Number })
  sliceSize?: number;
}
