import { sortBy, isNumber } from 'lodash';
import {
  DatabaseAnalysis,
  Key,
  NspSummary,
  NspTypeSummary,
  SimpleSummary,
  SimpleTypeSummary,
  SumGroup,
} from 'src/modules/database-analysis/models';
import { RedisString } from 'src/common/constants';
import { Injectable } from '@nestjs/common';
import { sortByNumberField } from 'src/utils/base.helper';

const TOP_KEYS_LIMIT = 15;
const TOP_NSP_LIMIT = 15;

@Injectable()
export class DatabaseAnalyzer {
  async analyze(
    analysis: Partial<DatabaseAnalysis>,
    keys: Key[],
  ): Promise<Partial<DatabaseAnalysis>> {
    const namespaces = await this.getNamespacesMap(keys, analysis.delimiter);

    return {
      ...analysis,
      totalKeys: await this.calculateSimpleSummary(keys, 1),
      totalMemory: await this.calculateSimpleSummary(keys, 'memory'),
      topKeysNsp: await this.calculateNspSummary(namespaces, 'keys'),
      topMemoryNsp: await this.calculateNspSummary(namespaces, 'memory'),
      topKeysLength: await this.calculateTopKeys([keys], 'length'),
      topKeysMemory: await this.calculateTopKeys([keys], 'memory'),
      expirationGroups: await this.calculateExpirationTimeGroups(keys),
    };
  }

  /**
   * Calculate summary based on field name (string) or number incr value
   * @param keys
   * @param field
   */
  async calculateSimpleSummary(
    keys: Key[],
    field: string | number,
  ): Promise<SimpleSummary> {
    const summary = {
      total: 0,
      types: new Map(),
    };

    if (isNumber(field)) {
      keys.forEach((key) => {
        summary.total += 1;
        summary.types.set(key.type, (summary.types.get(key.type) || 0) + 1);
      });
    } else {
      keys.forEach((key) => {
        summary.total += key[field];
        summary.types.set(
          key.type,
          (summary.types.get(key.type) || 0) + key[field],
        );
      });
    }

    return {
      ...summary,
      types: this.calculateSimpleTypeSummary(summary.types),
    };
  }

  /**
   * Converts type summary Map to SimpleTypeSummary array
   * Also sort DESC by "total" field
   * @param types
   */
  calculateSimpleTypeSummary(types: Map<string, any>): SimpleTypeSummary[] {
    return sortBy(
      [...types.keys()].map((type) => ({ type, total: types.get(type) })),
      'total',
    ).reverse();
  }

  /**
   * Create namespaces map
   * @param keys
   * @param delimiter
   */
  async getNamespacesMap(
    keys: Key[],
    delimiter: string,
  ): Promise<Map<string, any>> {
    const namespaces = new Map();

    keys.forEach((key) => {
      const nsp = this.getNamespace(key.name as Buffer, delimiter);
      if (!nsp) {
        return;
      }

      const namespace = namespaces.get(nsp) || {
        memory: 0,
        keys: 0,
        types: new Map(),
      };

      namespace.keys += 1;
      namespace.memory += key.memory;

      const namespaceType = namespace.types.get(key.type) || {
        memory: 0,
        keys: 0,
      };

      namespaceType.keys += 1;
      namespaceType.memory += key.memory;

      namespace.types.set(key.type, namespaceType);
      namespaces.set(nsp, namespace);
    });

    return namespaces;
  }

  /**
   * Finds specific delimiter in the Buffer and slice the bytes
   * Converts bytes to hex to work well with Map()
   * @param key
   * @param delimiter
   */
  getNamespace(key: Buffer, delimiter = ':'): string {
    const pos = key.indexOf(delimiter);
    if (pos > -1) {
      return key.slice(0, pos).toString('hex');
    }

    return undefined;
  }

  /**
   * Calculate top X namespaces by specific field
   * Converts Map to NspSummary array
   * @param namespaces
   * @param field
   */
  async calculateNspSummary(
    namespaces: Map<RedisString, any>,
    field: string,
  ): Promise<NspSummary[]> {
    const nspSummaries = sortBy(
      [...namespaces.keys()].map((nsp) => ({ nsp, ...namespaces.get(nsp) })),
      field,
    )
      .reverse()
      .slice(0, TOP_NSP_LIMIT);

    return nspSummaries.map((nspSummary) => ({
      ...nspSummary,
      nsp: Buffer.from(nspSummary.nsp || '', 'hex'), // convert hex string back to Buffer
      types: this.calculateNspTypeSummary(nspSummary.types, field),
    }));
  }

  /**
   * Converts type summary Map to NspTypeSummary array
   * Also sort DESC by specific field
   * @param nspTypes
   * @param field
   */
  calculateNspTypeSummary(
    nspTypes: Map<string, any>,
    field: string,
  ): NspTypeSummary[] {
    return sortBy(
      [...nspTypes.keys()].map((type) => ({ type, ...nspTypes.get(type) })),
      field,
    ).reverse();
  }

  /**
   * Calculates top keys by specific field
   * Waiting for batches of keys arrays to increase performance
   * E.g. sorting has O(n*n) complexity so it is better to sort data in small batches,
   * find top X elements and then find top X tops from the batches.
   * @param keysBatches
   * @param field
   */
  async calculateTopKeys(keysBatches: Key[][], field: string): Promise<Key[]> {
    return sortByNumberField(
      [].concat(
        ...keysBatches.map((keysBatch) =>
          sortByNumberField(keysBatch, field)
            .reverse()
            .slice(0, TOP_KEYS_LIMIT),
        ),
      ),
      field,
    )
      .reverse()
      .slice(0, TOP_KEYS_LIMIT);
  }

  async calculateExpirationTimeGroups(keys: Key[]): Promise<SumGroup[]> {
    const groups = [
      {
        threshold: 0,
        total: 0,
        label: 'No Expiry',
      },
      {
        threshold: 60 * 60,
        total: 0,
        label: '<1 hr',
      },
      {
        threshold: 4 * 60 * 60,
        total: 0,
        label: '1-4 Hrs',
      },
      {
        threshold: 12 * 60 * 60,
        total: 0,
        label: '4-12 Hrs',
      },
      {
        threshold: 24 * 60 * 60,
        total: 0,
        label: '12-24 Hrs',
      },
      {
        threshold: 7 * 24 * 60 * 60,
        total: 0,
        label: '1-7 Days',
      },
      {
        threshold: 30 * 24 * 60 * 60,
        total: 0,
        label: '>7 Days',
      },
      {
        threshold: Number.MAX_SAFE_INTEGER,
        total: 0,
        label: '>1 Month',
      },
    ];

    keys.forEach((key) => {
      for (let i = 0; i < groups.length; i += 1) {
        if (key.ttl < groups[i].threshold) {
          groups[i].total += key.memory;
          break;
        }
      }
    });

    return groups;
  }
}
