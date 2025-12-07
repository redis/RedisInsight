import { RedisString } from 'src/common/constants';
import { AbstractInfoStrategy } from 'src/modules/database-analysis/scanner/key-info/strategies/abstract.info.strategy';
import { convertArrayReplyToObject } from 'src/modules/redis/utils';
import { RedisClient } from 'src/modules/redis/client';

export class TsInfoStrategy extends AbstractInfoStrategy {
  async getLength(client: RedisClient, key: RedisString): Promise<number> {
    const { totalsamples } = convertArrayReplyToObject(
      (await client.sendCommand(['ts.info', key], {
        replyEncoding: 'utf8',
      })) as string[],
    );

    return totalsamples;
  }
}
