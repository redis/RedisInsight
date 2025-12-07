import { RedisString } from 'src/common/constants';
import { AbstractInfoStrategy } from 'src/modules/database-analysis/scanner/key-info/strategies/abstract.info.strategy';
import { RedisClient } from 'src/modules/redis/client';

export class JsonInfoStrategy extends AbstractInfoStrategy {
  async getLength(client: RedisClient, key: RedisString): Promise<number> {
    const objectKeyType = await client.sendCommand(['json.type', key], {
      replyEncoding: 'utf8',
    });

    switch (objectKeyType) {
      case 'object':
        return (await client.sendCommand(['json.objlen', key], {
          replyEncoding: 'utf8',
        })) as number;
      case 'array':
        return (await client.sendCommand(['json.arrlen', key], {
          replyEncoding: 'utf8',
        })) as number;
      case 'string':
        return (await client.sendCommand(['json.strlen', key], {
          replyEncoding: 'utf8',
        })) as number;
      default:
        return null;
    }
  }
}
