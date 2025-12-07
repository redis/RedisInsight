import {
  GetKeyInfoResponse,
  RedisDataType,
} from 'src/modules/browser/keys/dto';
import {
  BrowserToolKeysCommands,
  BrowserToolTSCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { RedisString } from 'src/common/constants';
import { convertArrayReplyToObject } from 'src/modules/redis/utils';
import { KeyInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/key-info.strategy';
import { RedisClient } from 'src/modules/redis/client';

export class TsKeyInfoStrategy extends KeyInfoStrategy {
  private async getTotalSamples(
    client: RedisClient,
    key: RedisString,
  ): Promise<number> {
    try {
      const info = (await client.sendCommand(
        [BrowserToolTSCommands.TSInfo, key],
        { replyEncoding: 'utf8' },
      )) as string[];

      return convertArrayReplyToObject(info).totalsamples;
    } catch (error) {
      return undefined;
    }
  }

  public async getInfo(
    client: RedisClient,
    key: RedisString,
    type: string,
  ): Promise<GetKeyInfoResponse> {
    this.logger.debug(`Getting ${RedisDataType.TS} type info.`);

    const [[, ttl = null], [, size = null]] = (await client.sendPipeline([
      [BrowserToolKeysCommands.Ttl, key],
      [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
    ])) as [any, number][];

    const length = await this.getTotalSamples(client, key);

    return {
      name: key,
      type,
      ttl,
      size,
      length,
    };
  }
}
