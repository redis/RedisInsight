import {
  GetKeyInfoResponse,
  RedisDataType,
} from 'src/modules/browser/keys/dto';
import {
  BrowserToolArrayCommands,
  BrowserToolKeysCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { RedisString } from 'src/common/constants';
import { KeyInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/key-info.strategy';
import { RedisClient, RedisClientCommandReply } from 'src/modules/redis/client';
import { MAX_KEY_SIZE } from 'src/modules/browser/keys/key-info/constants';

interface ArrayInfo {
  arrayLogicalLength?: string;
  arrayNextIndex?: string;
}

export class ArrayKeyInfoStrategy extends KeyInfoStrategy {
  public async getInfo(
    client: RedisClient,
    key: RedisString,
    type: string,
    includeSize: boolean,
  ): Promise<GetKeyInfoResponse> {
    this.logger.debug(`Getting ${RedisDataType.Array} type info.`);

    if (includeSize !== false) {
      const [
        [, ttl = null],
        [, length = null],
        [, size = null],
        [, arInfo = []],
      ] = (await client.sendPipeline([
        [BrowserToolKeysCommands.Ttl, key],
        [BrowserToolArrayCommands.ARCount, key],
        [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
        [BrowserToolArrayCommands.ARInfo, key],
      ])) as [any, any][];

      return {
        name: key,
        type,
        ttl,
        size,
        length: Number(length),
        ...this.parseArInfo(arInfo),
      };
    }

    const [[, ttl = null], [, length = null], [, arInfo = []]] =
      (await client.sendPipeline([
        [BrowserToolKeysCommands.Ttl, key],
        [BrowserToolArrayCommands.ARCount, key],
        [BrowserToolArrayCommands.ARInfo, key],
      ])) as [any, any][];

    let size = -1;
    if (Number(length) < MAX_KEY_SIZE) {
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
      length: Number(length),
      ...this.parseArInfo(arInfo),
    };
  }

  private parseArInfo(reply: RedisClientCommandReply): ArrayInfo {
    const info: Record<string, RedisClientCommandReply> = {};

    if (Array.isArray(reply)) {
      for (let i = 0; i < reply.length - 1; i += 2) {
        info[String(reply[i])] = reply[i + 1];
      }
    } else if (reply && typeof reply === 'object') {
      Object.assign(info, reply);
    }

    return {
      arrayLogicalLength: this.normalizeIntegerReply(info.len),
      arrayNextIndex: this.normalizeIntegerReply(info['next-insert-index']),
    };
  }

  private normalizeIntegerReply(value: RedisClientCommandReply): string {
    if (Buffer.isBuffer(value)) {
      return value.toString();
    }

    if (value === null || value === undefined) {
      return '0';
    }

    return String(value);
  }
}
