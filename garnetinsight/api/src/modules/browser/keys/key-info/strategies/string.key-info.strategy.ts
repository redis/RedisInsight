import {
  GetKeyInfoResponse,
  RedisDataType,
} from 'src/modules/browser/keys/dto';
import {
  BrowserToolKeysCommands,
  BrowserToolStringCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { RedisString } from 'src/common/constants';
import { KeyInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/key-info.strategy';
import { RedisClient } from 'src/modules/redis/client';

export class StringKeyInfoStrategy extends KeyInfoStrategy {
  public async getInfo(
    client: RedisClient,
    key: RedisString,
    type: string,
  ): Promise<GetKeyInfoResponse> {
    this.logger.debug(`Getting ${RedisDataType.String} type info.`);

    const [[, ttl = null], [, size = null], [, length = null]] =
      (await client.sendPipeline([
        [BrowserToolKeysCommands.Ttl, key],
        [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
        [BrowserToolStringCommands.StrLen, key],
      ])) as [any, number][];

    return {
      name: key,
      type,
      ttl,
      size,
      length,
    };
  }
}
