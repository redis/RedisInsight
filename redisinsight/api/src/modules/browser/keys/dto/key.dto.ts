import { ApiProperty } from '@nestjs/swagger'
import { IsDefined } from 'class-validator'
import { IsRedisString, RedisStringType } from 'src/common/decorators'
import { RedisString } from 'src/common/constants'

export enum RedisDataType {
  String = 'string',
  Hash = 'hash',
  List = 'list',
  Set = 'set',
  ZSet = 'zset',
  Stream = 'stream',
  JSON = 'ReJSON-RL',
  Graph = 'graphdata',
  TS = 'TSDB-TYPE',
  VectorSet = 'vectorset',
}

export class KeyDto {
  @ApiProperty({
    description: 'Key Name',
    type: String,
  })
  @IsDefined()
  @IsRedisString()
  @RedisStringType()
  keyName: RedisString
}
