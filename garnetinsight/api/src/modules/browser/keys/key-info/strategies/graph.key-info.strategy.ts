import {
  GetKeyInfoResponse,
  RedisDataType,
} from 'src/modules/browser/keys/dto';
import {
  BrowserToolGraphCommands,
  BrowserToolKeysCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { RedisString } from 'src/common/constants';
import { KeyInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/key-info.strategy';
import { RedisClient } from 'src/modules/redis/client';

export class GraphKeyInfoStrategy extends KeyInfoStrategy {
  public async getInfo(
    client: RedisClient,
    key: RedisString,
    type: string,
  ): Promise<GetKeyInfoResponse> {
    this.logger.debug(`Getting ${RedisDataType.Graph} type info.`);
    const [[, ttl = null], [, size = null]] = (await client.sendPipeline([
      [BrowserToolKeysCommands.Ttl, key],
      [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
    ])) as [any, number][];

    const length = await this.getNodesCount(client, key);

    return {
      name: key,
      type,
      ttl,
      size,
      length,
    };
  }

  private async getNodesCount(
    client: RedisClient,
    key: RedisString,
  ): Promise<number> {
    try {
      const queryReply = await client.sendCommand([
        BrowserToolGraphCommands.GraphQuery,
        key,
        'MATCH (r) RETURN count(r)',
        '--compact',
      ]);

      return queryReply[1][0][0][1];
    } catch (error) {
      return undefined;
    }
  }
}
