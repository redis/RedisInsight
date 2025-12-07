import {
  GetKeyInfoResponse,
  RedisDataType,
} from 'src/modules/browser/keys/dto';
import {
  BrowserToolKeysCommands,
  BrowserToolRejsonRlCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { RedisString } from 'src/common/constants';
import { KeyInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/key-info.strategy';
import { RedisClient } from 'src/modules/redis/client';

export class RejsonRlKeyInfoStrategy extends KeyInfoStrategy {
  public async getInfo(
    client: RedisClient,
    key: RedisString,
    type: string,
    includeSize: boolean,
  ): Promise<GetKeyInfoResponse> {
    this.logger.debug(`Getting ${RedisDataType.JSON} type info.`);

    if (includeSize !== false) {
      const [[, ttl = null], [, size = null]] = (await client.sendPipeline([
        [BrowserToolKeysCommands.Ttl, key],
        [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
      ])) as [any, number][];

      const length = await this.getLength(client, key);

      return {
        name: key,
        type,
        ttl,
        size,
        length,
      };
    }

    const [[, ttl = null]] = (await client.sendPipeline([
      [BrowserToolKeysCommands.Ttl, key],
    ])) as [any, number][];

    const length = await this.getLength(client, key);

    let size = -1;
    if (length < 100) {
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

  private async getLength(
    client: RedisClient,
    key: RedisString,
  ): Promise<number> {
    try {
      const objectKeyType = await client.sendCommand(
        [BrowserToolRejsonRlCommands.JsonType, key],
        { replyEncoding: 'utf8' },
      );

      switch (objectKeyType) {
        case 'object':
          return (await client.sendCommand(
            [BrowserToolRejsonRlCommands.JsonObjLen, key],
            { replyEncoding: 'utf8' },
          )) as number;
        case 'array':
          return (await client.sendCommand(
            [BrowserToolRejsonRlCommands.JsonArrLen, key],
            { replyEncoding: 'utf8' },
          )) as number;
        case 'string':
          return (await client.sendCommand(
            [BrowserToolRejsonRlCommands.JsonStrLen, key],
            { replyEncoding: 'utf8' },
          )) as number;
        default:
          return null;
      }
    } catch (error) {
      return null;
    }
  }
}
