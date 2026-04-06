import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';
import { HealthStatus } from 'src/modules/cluster-monitor/models';

interface ClusterShardNodeRaw {
  id: string;
  port: number | undefined;
  ip: string;
  endpoint: string;
  hostname: string;
  role: 'master' | 'slave';
  'replication-offset': number;
  health: string;
  'tls-port': number | undefined;
}

interface ClusterShardRaw {
  slots: number[];
  nodes: ClusterShardNodeRaw[];
}

/**
 * Converts a node object into the flat key-value array format
 * that Redis returns (e.g. `['id', 'abc', 'port', 6379, ...]`).
 */
export const toNodeReplyArray = (obj: Record<string, any>): any[] => {
  const result: any[] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result.push(key, value);
    }
  }
  return result;
};

export const clusterShardNodeRawFactory = Factory.define<ClusterShardNodeRaw>(
  () => ({
    id: faker.string.hexadecimal({ length: 40, prefix: '' }),
    port: faker.number.int({ min: 6379, max: 6400 }),
    ip: faker.internet.ipv4(),
    endpoint: faker.internet.ipv4(),
    hostname: '',
    role: 'master',
    'replication-offset': faker.number.int({ min: 0, max: 200000 }),
    health: faker.helpers.arrayElement(Object.values(HealthStatus)),
    'tls-port': undefined,
  }),
);

export const clusterShardRawFactory = Factory.define<ClusterShardRaw>(
  ({ transientParams }) => {
    const slotStart = transientParams.slotStart ?? 0;
    const slotEnd =
      transientParams.slotEnd ??
      faker.number.int({ min: slotStart, max: 16383 });
    const nodes = transientParams.nodes ?? [clusterShardNodeRawFactory.build()];

    return {
      slots: [slotStart, slotEnd],
      nodes,
    };
  },
);

/**
 * Converts a ClusterShardRaw into the full `CLUSTER SHARDS` reply entry:
 * `['slots', [...], 'nodes', [[...], [...]]]`
 */
export const toClusterShardsReplyEntry = (shard: ClusterShardRaw): any[] => [
  'slots',
  shard.slots,
  'nodes',
  shard.nodes.map(toNodeReplyArray),
];

export const formatSlotRange = (start: number, end: number): string =>
  start === end ? `${start}` : `${start}-${end}`;
