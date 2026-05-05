import { IsDefined } from 'class-validator';
import {
  ApiRedisString,
  IsRedisString,
  RedisStringType,
} from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

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
  @ApiRedisString('Key Name')
  @IsDefined()
  @IsRedisString()
  @RedisStringType()
  keyName: RedisString;
}
