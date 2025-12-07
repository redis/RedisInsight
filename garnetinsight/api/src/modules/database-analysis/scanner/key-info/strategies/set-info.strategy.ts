import { RedisString } from 'src/common/constants';
import { AbstractInfoStrategy } from 'src/modules/database-analysis/scanner/key-info/strategies/abstract.info.strategy';
import { RedisClient } from 'src/modules/redis/client';

export class SetInfoStrategy extends AbstractInfoStrategy {
  async getLength(client: RedisClient, key: RedisString): Promise<number> {
    return (await client.sendCommand(['scard', key])) as number;
  }
}
