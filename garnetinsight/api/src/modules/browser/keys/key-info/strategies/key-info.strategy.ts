import { Injectable, Logger } from '@nestjs/common';
import { GetKeyInfoResponse } from 'src/modules/browser/keys/dto';
import { RedisString } from 'src/common/constants';
import { RedisClient } from 'src/modules/redis/client';

@Injectable()
export abstract class KeyInfoStrategy {
  protected readonly logger = new Logger(this.constructor.name);

  abstract getInfo(
    client: RedisClient,
    key: RedisString,
    type: string,
    includeSize: boolean,
  ): Promise<GetKeyInfoResponse>;
}
