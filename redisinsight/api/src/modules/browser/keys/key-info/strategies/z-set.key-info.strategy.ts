import {
  GetKeyInfoResponse,
  RedisDataType,
} from 'src/modules/browser/keys/dto';
import {
  BrowserToolKeysCommands,
  BrowserToolZSetCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { RedisString } from 'src/common/constants';
import { KeyInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/key-info.strategy';
import { RedisClient } from 'src/modules/redis/client';
import { MAX_KEY_SIZE } from 'src/modules/browser/keys/key-info/constants';

export class ZSetKeyInfoStrategy extends KeyInfoStrategy {
  public async getInfo(
    client: RedisClient,
    key: RedisString,
    type: string,
    includeSize: boolean,
  ): Promise<GetKeyInfoResponse> {
    this.logger.debug(`Getting ${RedisDataType.ZSet} type info.`);

    if (includeSize !== false) {
      const [[, ttl = null], [, length = null], [, size = null]] =
        (await client.sendPipeline([
          [BrowserToolKeysCommands.Ttl, key],
          [BrowserToolZSetCommands.ZCard, key],
          [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
        ])) as [any, number][];

      return {
        name: key,
        type,
        ttl,
        size,
        length,
      };
    }

    const [[, ttl = null], [, length = null]] = (await client.sendPipeline([
      [BrowserToolKeysCommands.Ttl, key],
      [BrowserToolZSetCommands.ZCard, key],
    ])) as [any, number][];

    let size = -1;
    if (length < MAX_KEY_SIZE) {
      const sizeData = (await client.sendPipeline([
        [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
      ])) as [any, number][];
      size = sizeData && sizeData[0] && sizeData[0][1];
    }

    return {
      name: key,
      type,
      ttl,
      size,
      length,
    };
  }
}
