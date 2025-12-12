import { GetKeyInfoResponse, RedisDataType } from 'src/modules/browser/keys/dto'
import {
  BrowserToolKeysCommands,
  BrowserToolVectorSetCommands,
} from 'src/modules/browser/constants/browser-tool-commands'
import { RedisString } from 'src/common/constants'
import { KeyInfoStrategy } from 'src/modules/browser/keys/key-info/strategies/key-info.strategy'
import { RedisClient } from 'src/modules/redis/client'

// TODO: The getInfo logic (TTL + count command + conditional MEMORY USAGE) is duplicated
// across many strategies (hash, list, set, stream, z-set, vector-set).
// Consider extracting a generic helper method in the base KeyInfoStrategy class.
export class VectorSetKeyInfoStrategy extends KeyInfoStrategy {
  public async getInfo(
    client: RedisClient,
    key: RedisString,
    type: string,
    includeSize: boolean,
  ): Promise<GetKeyInfoResponse> {
    this.logger.debug(`Getting ${RedisDataType.VectorSet} type info.`)

    if (includeSize !== false) {
      const [[, ttl = null], [, length = null], [, size = null]] =
        (await client.sendPipeline([
          [BrowserToolKeysCommands.Ttl, key],
          [BrowserToolVectorSetCommands.VCard, key],
          [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
        ])) as [any, number][]

      return {
        name: key,
        type,
        ttl,
        size,
        length,
      }
    }

    const [[, ttl = null], [, length = null]] = (await client.sendPipeline([
      [BrowserToolKeysCommands.Ttl, key],
      [BrowserToolVectorSetCommands.VCard, key],
    ])) as [any, number][]

    let size = -1
    if (length < 50_000) {
      const sizeData = (await client.sendPipeline([
        [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
      ])) as [any, number][]
      size = sizeData && sizeData[0] && sizeData[0][1]
    }

    return {
      name: key,
      type,
      ttl,
      size,
      length,
    }
  }
}
