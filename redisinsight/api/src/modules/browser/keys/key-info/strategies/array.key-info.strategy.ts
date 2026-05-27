import {
  GetKeyInfoResponse,
  RedisDataType,
} from 'src/modules/browser/keys/dto';
import {
  BrowserToolKeysCommands,
  BrowserToolArrayCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { RedisString } from 'src/common/constants';
import { KeyInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/key-info.strategy';
import { RedisClient } from 'src/modules/redis/client';
import { MAX_KEY_SIZE } from 'src/modules/browser/keys/key-info/constants';

enum ArInfoField {
  NextInsertIndex = 'next-insert-index',
  Slices = 'slices',
  SliceSize = 'slice-size',
}

interface ArrayInfo {
  nextInsertIndex?: number;
  slices?: number;
  sliceSize?: number;
}

export class ArrayKeyInfoStrategy extends KeyInfoStrategy {
  /**
   * Parse ARINFO response to extract metadata.
   * ARINFO returns a flat array like:
   * ["count","4","len","4","next-insert-index","0","slices","1","slice-size","4096",...]
   */
  private parseArInfo(arInfoResponse: (string | number)[]): ArrayInfo {
    const result: ArrayInfo = {};

    if (!Array.isArray(arInfoResponse)) {
      return result;
    }

    if (arInfoResponse.length % 2 !== 0) {
      this.logger.warn(
        `ARINFO response length ${arInfoResponse.length} is odd; dropping trailing unpaired entry.`,
      );
    }

    for (let i = 0; i < arInfoResponse.length - 1; i += 2) {
      const key = String(arInfoResponse[i]).toLowerCase();
      const value = arInfoResponse[i + 1];

      if (key === ArInfoField.NextInsertIndex) {
        result.nextInsertIndex = Number(value);
      } else if (key === ArInfoField.Slices) {
        result.slices = Number(value);
      } else if (key === ArInfoField.SliceSize) {
        result.sliceSize = Number(value);
      }
    }

    return result;
  }

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
        [BrowserToolArrayCommands.ArCount, key],
        [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
        [BrowserToolArrayCommands.ArInfo, key],
      ])) as [any, any][];

      const { nextInsertIndex, slices, sliceSize } = this.parseArInfo(arInfo);

      return {
        name: key,
        type,
        ttl,
        size,
        length,
        nextInsertIndex,
        slices,
        sliceSize,
      };
    }

    const [[, ttl = null], [, length = null], [, arInfo = []]] =
      (await client.sendPipeline([
        [BrowserToolKeysCommands.Ttl, key],
        [BrowserToolArrayCommands.ArCount, key],
        [BrowserToolArrayCommands.ArInfo, key],
      ])) as [any, any][];

    const { nextInsertIndex, slices, sliceSize } = this.parseArInfo(arInfo);

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
      nextInsertIndex,
      slices,
      sliceSize,
    };
  }
}
