import { ApiProperty } from '@nestjs/swagger';
import { IsRedisString, RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { KeyDto } from 'src/modules/browser/keys/dto';
import { Type } from 'class-transformer';

export class ConsumerGroupDto {
  @ApiProperty({
    type: String,
    description: 'Consumer Group name',
    example: 'group',
  })
  @RedisStringType()
  name: RedisString;

  @ApiProperty({
    type: Number,
    description: 'Number of consumers',
    example: 2,
  })
  consumers: number = 0;

  @ApiProperty({
    type: Number,
    description: 'Number of pending messages',
    example: 2,
  })
  pending: number = 0;

  @ApiProperty({
    type: String,
    description: 'Smallest Id of the message that is pending in the group',
    example: '1657892649-0',
  })
  smallestPendingId: string;

  @ApiProperty({
    type: String,
    description: 'Greatest Id of the message that is pending in the group',
    example: '1657892680-0',
  })
  greatestPendingId: string;

  @ApiProperty({
    type: String,
    description: 'Id of last delivered message',
    example: '1657892648-0',
  })
  lastDeliveredId: string;
}

export class CreateConsumerGroupDto {
  @ApiProperty({
    type: String,
    description: 'Consumer group name',
    example: 'group',
  })
  @IsNotEmpty()
  @IsRedisString()
  @RedisStringType()
  name: RedisString;

  @ApiProperty({
    type: String,
    description: 'Id of last delivered message',
    example: '1657892648-0',
  })
  @IsNotEmpty()
  @IsString()
  lastDeliveredId: string;
}

export class CreateConsumerGroupsDto extends KeyDto {
  @ApiProperty({
    type: () => CreateConsumerGroupDto,
    isArray: true,
    description: 'List of consumer groups to create',
  })
  @ValidateNested()
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => CreateConsumerGroupDto)
  consumerGroups: CreateConsumerGroupDto[];
}
