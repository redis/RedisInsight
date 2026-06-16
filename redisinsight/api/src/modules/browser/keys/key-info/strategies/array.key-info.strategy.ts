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
import { RedisClient } from 'src/modules/redis/client';
import { MAX_KEY_SIZE } from 'src/modules/browser/keys/key-info/constants';
import { toIndexString } from 'src/modules/browser/array/utils';

/**
 * Key-info strategy for the Array data type. Returns the standard
 * TTL / size / length triple plus a `count` field carrying the number of
 * populated slots (ARCOUNT). Length reflects total addressable slots
 * (ARLEN, including gaps); count reflects only the populated ones — the
 * two diverge for sparse arrays and the View tab surfaces both.
 *
 * `length` and `count` are normalized to decimal strings to match the
 * unsigned 64-bit contract used by the array read endpoints (ARLEN can
 * exceed Number.MAX_SAFE_INTEGER for sparse arrays).
 */
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
        [, rawLength = null],
        [, rawCount = null],
        [, size = null],
      ] = (await client.sendPipeline([
        [BrowserToolKeysCommands.Ttl, key],
        [BrowserToolArrayCommands.ArLen, key],
        [BrowserToolArrayCommands.ArCount, key],
        [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
      ])) as [any, any][];

      return {
        name: key,
        type,
        ttl,
        size,
        length: rawLength == null ? undefined : toIndexString(rawLength),
        count: rawCount == null ? undefined : toIndexString(rawCount),
      };
    }

    const [[, ttl = null], [, rawLength = null], [, rawCount = null]] =
      (await client.sendPipeline([
        [BrowserToolKeysCommands.Ttl, key],
        [BrowserToolArrayCommands.ArLen, key],
        [BrowserToolArrayCommands.ArCount, key],
      ])) as [any, any][];

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
      length: rawLength == null ? undefined : toIndexString(rawLength),
      count: rawCount == null ? undefined : toIndexString(rawCount),
    };
  }
}
