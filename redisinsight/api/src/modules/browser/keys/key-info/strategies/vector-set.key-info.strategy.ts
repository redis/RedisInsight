import {
  GetKeyInfoResponse,
  RedisDataType,
  VectorSetInfo,
} from 'src/modules/browser/keys/dto';
import {
  BrowserToolKeysCommands,
  BrowserToolVectorSetCommands,
} from 'src/modules/browser/constants/browser-tool-commands';
import { RedisString } from 'src/common/constants';
import { KeyInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/key-info.strategy';
import { RedisClient } from 'src/modules/redis/client';

// TODO: The getInfo logic (TTL + count command + conditional MEMORY USAGE) is duplicated
// across many strategies (hash, list, set, stream, z-set, vector-set).
// Consider extracting a generic helper method in the base KeyInfoStrategy class.
export class VectorSetKeyInfoStrategy extends KeyInfoStrategy {
  /**
   * Parse VINFO response into VectorSetInfo object
   * VINFO returns: ['quant-type', 'int8', 'vector-dim', 300, 'size', 3000000, ...]
   */
  private parseVInfo(
    vinfoResponse: (string | number)[] | null,
  ): VectorSetInfo | undefined {
    if (!vinfoResponse || !Array.isArray(vinfoResponse)) {
      return undefined;
    }

    const result: VectorSetInfo = {};

    for (let i = 0; i < vinfoResponse.length - 1; i += 2) {
      const key = String(vinfoResponse[i]);
      const value = vinfoResponse[i + 1];

      switch (key) {
        case 'quant-type':
          result['quant-type'] = String(value);
          break;
        case 'vector-dim':
          result['vector-dim'] = Number(value);
          break;
        case 'size':
          result.size = Number(value);
          break;
        case 'max-level':
          result['max-level'] = Number(value);
          break;
        case 'vset-uid':
          result['vset-uid'] = Number(value);
          break;
        case 'hnsw-max-node-uid':
          result['hnsw-max-node-uid'] = Number(value);
          break;
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
        [, vinfoResponse = null],
      ] = (await client.sendPipeline([
        [BrowserToolKeysCommands.Ttl, key],
        [BrowserToolVectorSetCommands.VCard, key],
        [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
        [BrowserToolVectorSetCommands.VInfo, key],
      ])) as [any, any][];

      const vinfo = this.parseVInfo(vinfoResponse);

      return {
        name: key,
        type,
        ttl,
        size,
        length,
        vinfo,
      };
    }

    const [[, ttl = null], [, length = null], [, vinfoResponse = null]] =
      (await client.sendPipeline([
        [BrowserToolKeysCommands.Ttl, key],
        [BrowserToolVectorSetCommands.VCard, key],
        [BrowserToolVectorSetCommands.VInfo, key],
      ])) as [any, any][];

    let size = -1;
    if (length < 50_000) {
      const sizeData = (await client.sendPipeline([
        [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
      ])) as [any, number][];
      size = sizeData && sizeData[0] && sizeData[0][1];
    }

    const vinfo = this.parseVInfo(vinfoResponse);

    return {
      name: key,
      type,
      ttl,
      size,
      length,
      vinfo,
    };
  }
}
