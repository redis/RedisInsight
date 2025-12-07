import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { GetKeyInfoResponse } from 'src/modules/browser/keys/dto';
import { RedisClient } from 'src/modules/redis/client';

export class SearchJSON {
  @ApiProperty({
    description: 'Redis client',
  })
  @Expose()
  client: RedisClient;

  @ApiProperty({
    description: 'Database id',
    type: String,
    example: 'id',
  })
  @Expose()
  databaseId: string;

  @ApiProperty({
    description: 'Keys info',
    type: GetKeyInfoResponse,
  })
  @Expose()
  keys: GetKeyInfoResponse[];
}
