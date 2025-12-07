import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDefined, IsInt, IsOptional, Max, Min } from 'class-validator';
import { IsRedisString, RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';
import { MAX_TTL_NUMBER } from 'src/constants';

export class HashFieldDto {
  @ApiProperty({
    description: 'Field',
    type: String,
  })
  @IsDefined()
  @IsRedisString()
  @RedisStringType()
  field: RedisString;

  @ApiProperty({
    description: 'Field',
    type: String,
  })
  @IsDefined()
  @IsRedisString()
  @RedisStringType()
  value: RedisString;

  @ApiPropertyOptional({
    type: Number,
    description: 'Set timeout on field in seconds',
    minimum: 1,
    maximum: MAX_TTL_NUMBER,
  })
  @IsOptional()
  @IsInt({ always: true })
  @Min(1)
  @Max(MAX_TTL_NUMBER)
  expire?: number;
}
