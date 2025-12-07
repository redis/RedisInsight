import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { KeyDto } from './key.dto';

export class ScanDataTypeDto extends KeyDto {
  @ApiProperty({
    description:
      'Iteration cursor. ' +
      'An iteration starts when the cursor is set to 0, and terminates when the cursor returned by the server is 0.',
    type: Number,
    minimum: 0,
    default: 0,
  })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  @IsNotEmpty()
  cursor: number;

  @ApiPropertyOptional({
    description: 'Specifying the number of elements to return.',
    type: Number,
    minimum: 1,
    default: 15,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsNotEmpty()
  @IsOptional()
  count?: number;

  @ApiPropertyOptional({
    description: 'Iterate only elements matching a given pattern.',
    type: String,
    default: '*',
  })
  @IsOptional()
  @IsString()
  match?: string;
}
