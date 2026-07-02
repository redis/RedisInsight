import {
  GetArrayKeyInfoResponse,
  RedisDataType,
} from 'src/modules/browser/keys/dto';
import {
  BrowserToolArrayCommands,
  BrowserToolKeysCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { RedisString } from 'src/common/constants';
import { KeyInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/key-info.strategy';
import { RedisClient } from 'src/modules/redis/client';
import { MAX_KEY_SIZE } from 'src/modules/browser/keys/key-info/constants';
import { toRequiredIndexString } from 'src/modules/browser/array/utils';

/**
 * Key-info strategy for the Array data type. Returns TTL / size plus
 * `length` (ARLEN, includes gaps) and `count` (ARCOUNT, populated only) —
 * the two diverge for sparse arrays.
 *
 * Uses a dedicated `GetArrayKeyInfoResponse` so `length` / `count` stay
 * decimal strings; the shared `GetKeyInfoResponse.length: number` would
 * silently lose precision for u64 indexes.
 */
export class ArrayKeyInfoStrategy extends KeyInfoStrategy {
  public async getInfo(
    client: RedisClient,
    key: RedisString,
    type: string,
    includeSize: boolean,
  ): Promise<GetArrayKeyInfoResponse> {
    this.logger.debug(`Getting ${RedisDataType.Array} type info.`);

    // sendPipeline can't pass per-command options, so it would round u64
    // ARLEN / ARCOUNT replies in (2^53, 2^63); read those per-command with the
    // bigint opt-in. TTL / MEMORY USAGE stay pipelined to degrade to size: -1.
    const readCounts = () =>
      Promise.all([
        client.sendCommand([BrowserToolArrayCommands.ArLen, key], {
          integerReply: 'bigint',
        }),
        client.sendCommand([BrowserToolArrayCommands.ArCount, key], {
          integerReply: 'bigint',
        }),
      ]);

    if (includeSize !== false) {
      const [[, ttl = null], [, size = null]] = (await client.sendPipeline([
        [BrowserToolKeysCommands.Ttl, key],
        [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
      ])) as [any, any][];
      const [rawLength, rawCount] = await readCounts();

      return {
        name: key,
        type,
        ttl,
        size,
        length: toRequiredIndexString(rawLength),
        count: toRequiredIndexString(rawCount),
      };
    }

    const [[, ttl = null]] = (await client.sendPipeline([
      [BrowserToolKeysCommands.Ttl, key],
    ])) as [any, any][];
    const [rawLength, rawCount] = await readCounts();

    // Sparse arrays can have huge `length` (ARLEN, total addressable slots)
    // while `count` (ARCOUNT, populated slots) stays small. MEMORY USAGE cost
    // scales with stored data, so gate on `count` — otherwise a sparse key
    // with few populated slots would report `size: -1` despite being cheap.
    let size = -1;
    if (rawCount != null && Number(rawCount) < MAX_KEY_SIZE) {
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
      length: toRequiredIndexString(rawLength),
      count: toRequiredIndexString(rawCount),
    };
  }
}
