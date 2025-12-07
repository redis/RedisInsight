import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDefined, IsEnum, IsOptional } from 'class-validator';
import { IsRedisString, RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';
import { KeyDto, RedisDataType } from './key.dto';

export class GetKeyInfoDto extends KeyDto {
  @ApiPropertyOptional({
    description:
      'Flag to determine if size should be requested and shown in the response',
    type: Boolean,
    default: false,
  })
  @IsOptional()
  includeSize?: boolean;
}

export class GetKeysInfoDto {
  @ApiProperty({
    description: 'List of keys',
    type: String,
    isArray: true,
    example: ['keys', 'key2'],
  })
  @IsDefined()
  @IsRedisString({ each: true })
  @RedisStringType({ each: true })
  keys: RedisString[];

  @ApiPropertyOptional({
    description:
      'Iterate through the database looking for keys of a specific type.',
    enum: RedisDataType,
    example: RedisDataType.Hash,
  })
  @IsEnum(RedisDataType, {
    message: `destination must be a valid enum value. Valid values: ${Object.values(
      RedisDataType,
    )}.`,
  })
  @IsOptional()
  type?: RedisDataType;

  @ApiPropertyOptional({
    description:
      'Flag to determine if keys should be requested and shown in the response',
    type: Boolean,
    default: true,
  })
  @IsOptional()
  includeSize?: boolean;

  @ApiPropertyOptional({
    description:
      'Flag to determine if TTL should be requested and shown in the response',
    type: Boolean,
    default: true,
  })
  @IsOptional()
  includeTTL?: boolean;
}
