import { RedisString } from 'src/common/constants';
import { AbstractInfoStrategy } from 'src/modules/database-analysis/scanner/key-info/strategies/abstract.info.strategy';
import { RedisClient } from 'src/modules/redis/client';

export class GraphInfoStrategy extends AbstractInfoStrategy {
  async getLength(client: RedisClient, key: RedisString): Promise<number> {
    const resp = await client.sendCommand(
      ['graph.query', key, 'MATCH (r) RETURN count(r)', '--compact'],
      { replyEncoding: 'utf8' },
    );

    return resp[1][0][0][1];
  }
}
