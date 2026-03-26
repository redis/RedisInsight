import {
  GetKeyInfoResponse,
  RedisDataType,
} from 'src/modules/browser/keys/dto';
import {
  BrowserToolKeysCommands,
  BrowserToolVectorSetCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { RedisString } from 'src/common/constants';
import { KeyInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/key-info.strategy';
import { RedisClient } from 'src/modules/redis/client';
import { MAX_KEY_SIZE } from 'src/modules/browser/keys/key-info/constants';

interface VectorSetInfo {
  quantType?: string;
  vectorDim?: number;
}

export class VectorSetKeyInfoStrategy extends KeyInfoStrategy {
  /**
   * Parse VINFO response to extract quant type and vector dimensions.
   * VINFO returns a flat array like: ["quant-type", "int8", "vector-dim", 3, ...]
   */
  private parseVInfo(vInfoResponse: (string | number)[]): VectorSetInfo {
    const result: VectorSetInfo = {};

    if (!Array.isArray(vInfoResponse)) {
      return result;
    }

    for (let i = 0; i < vInfoResponse.length - 1; i += 2) {
      const key = String(vInfoResponse[i]).toLowerCase();
      const value = vInfoResponse[i + 1];

      if (key === 'quant-type') {
        result.quantType = String(value);
      } else if (key === 'vector-dim') {
        result.vectorDim = Number(value);
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
    this.logger.debug(`Getting ${RedisDataType.VectorSet} type info.`);

    if (includeSize !== false) {
      const [
        [, ttl = null],
        [, length = null],
        [, size = null],
        [, vInfo = []],
      ] = (await client.sendPipeline([
        [BrowserToolKeysCommands.Ttl, key],
        [BrowserToolVectorSetCommands.VCard, key],
        [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
        [BrowserToolVectorSetCommands.VInfo, key],
      ])) as [any, any][];

      const { quantType, vectorDim } = this.parseVInfo(vInfo);

      return {
        name: key,
        type,
        ttl,
        size,
        length,
        quantType,
        vectorDim,
      };
    }

    const [[, ttl = null], [, length = null], [, vInfo = []]] =
      (await client.sendPipeline([
        [BrowserToolKeysCommands.Ttl, key],
        [BrowserToolVectorSetCommands.VCard, key],
        [BrowserToolVectorSetCommands.VInfo, key],
      ])) as [any, any][];

    const { quantType, vectorDim } = this.parseVInfo(vInfo);

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
      quantType,
      vectorDim,
    };
  }
}
