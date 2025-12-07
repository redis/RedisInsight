import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { GetKeyInfoResponse } from './get.keys-info.response';

export class GetKeysWithDetailsResponse {
  @ApiProperty({
    type: Number,
    default: 0,
    description:
      'The new cursor to use in the next call.' +
      ' If the property has value of 0, then the iteration is completed.',
  })
  cursor: number;

  @ApiProperty({
    type: Number,
    description: 'The number of keys in the currently-selected database.',
  })
  total: number;

  @ApiProperty({
    type: Number,
    description:
      'The number of keys we tried to scan. Be aware that ' +
      'scanned is sum of COUNT parameters from redis commands',
  })
  scanned: number;

  @ApiProperty({
    type: () => GetKeyInfoResponse,
    description: 'Array of Keys.',
    isArray: true,
  })
  @IsArray()
  @Type(() => GetKeyInfoResponse)
  keys: GetKeyInfoResponse[];

  @ApiPropertyOptional({
    type: String,
    description: 'Node host. In case when we are working with cluster',
  })
  host?: string;

  @ApiPropertyOptional({
    type: Number,
    description: 'Node port. In case when we are working with cluster',
  })
  port?: number;

  @ApiPropertyOptional({
    type: Number,
    description:
      'The maximum number of results.' +
      ' For RediSearch this number is a value from "FT.CONFIG GET maxsearchresults" command.',
  })
  maxResults?: number;
}
