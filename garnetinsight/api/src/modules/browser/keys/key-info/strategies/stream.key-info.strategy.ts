import {
  GetKeyInfoResponse,
  RedisDataType,
} from 'src/modules/browser/keys/dto';
import {
  BrowserToolKeysCommands,
  BrowserToolStreamCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { RedisString } from 'src/common/constants';
import { KeyInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/key-info.strategy';
import { RedisClient } from 'src/modules/redis/client';

export class StreamKeyInfoStrategy extends KeyInfoStrategy {
  public async getInfo(
    client: RedisClient,
    key: RedisString,
    type: string,
    includeSize: boolean,
  ): Promise<GetKeyInfoResponse> {
    this.logger.debug(`Getting ${RedisDataType.Stream} type info.`);

    if (includeSize !== false) {
      const [[, ttl = null], [, length = null], [, size = null]] =
        (await client.sendPipeline([
          [BrowserToolKeysCommands.Ttl, key],
          [BrowserToolStreamCommands.XLen, key],
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
      [BrowserToolStreamCommands.XLen, key],
    ])) as [any, number][];

    let size = -1;
    if (length < 50_000) {
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
