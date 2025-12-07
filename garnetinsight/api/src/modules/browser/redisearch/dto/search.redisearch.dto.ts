import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsInt, IsString } from 'class-validator';
import { IsRedisString, RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

export class SearchRedisearchDto {
  @ApiProperty({
    description: 'Index Name',
    type: String,
  })
  @IsDefined()
  @RedisStringType()
  @IsRedisString()
  index: RedisString;

  @ApiProperty({
    description: 'Query to search inside data fields',
    type: String,
  })
  @IsDefined()
  @IsString()
  query: string;

  @ApiProperty({
    description: 'Limit number of results to be returned',
    type: Number,
  })
  @IsDefined()
  @IsInt()
  limit: number = 500; // todo use @Default from another PR

  @ApiProperty({
    description: 'Offset position to start searching',
    type: Number,
  })
  @IsDefined()
  @IsInt()
  offset: number = 0; // todo use @Default from another PR
}
