import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import { ClusterShardsInfoStrategy } from 'src/modules/cluster-monitor/strategies/cluster-shards.info.strategy';
import { mockClusterRedisClient } from 'src/__mocks__';
import {
  clusterShardNodeRawFactory,
  clusterShardRawFactory,
  toClusterShardsReplyEntry,
  toNodeReplyArray,
  formatSlotRange,
} from './__tests__/cluster-shards.factory';

const clusterClient = mockClusterRedisClient;

describe('ClusterShardsInfoStrategy', () => {
  let service: ClusterShardsInfoStrategy;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [ClusterShardsInfoStrategy],
    }).compile();

    service = module.get(ClusterShardsInfoStrategy);
  });

  describe('getClusterNodesFromRedis', () => {
    it('should return cluster info with ip when hostname is empty', async () => {
      const node1 = clusterShardNodeRawFactory.build();
      const node2 = clusterShardNodeRawFactory.build();
      const shard1 = clusterShardRawFactory.build(
        {},
        { transient: { slotStart: 0, slotEnd: 5000, nodes: [node1] } },
      );
      const shard2 = clusterShardRawFactory.build(
        {},
        { transient: { slotStart: 5001, slotEnd: 16383, nodes: [node2] } },
      );
      const reply = [shard1, shard2].map(toClusterShardsReplyEntry);
      when(clusterClient.sendCommand).mockResolvedValue(reply);

      const info = await service.getClusterNodesFromRedis(clusterClient);

      expect(info).toHaveLength(2);
      expect(info[0].host).toBe(node1.ip);
      expect(info[0].port).toBe(node1.port);
      expect(info[0].slots).toEqual([formatSlotRange(0, 5000)]);
      expect(info[1].host).toBe(node2.ip);
      expect(info[1].port).toBe(node2.port);
      expect(info[1].slots).toEqual([formatSlotRange(5001, 16383)]);
    });

    it('should use hostname when cluster-announce-hostname is configured', async () => {
      const hostname1 = 'redis-node-1.example.com';
      const hostname2 = 'redis-node-2.example.com';
      const master1 = clusterShardNodeRawFactory.build({
        hostname: hostname1,
      });
      const replica1 = clusterShardNodeRawFactory.build({
        hostname: hostname1,
        role: 'slave',
      });
      const master2 = clusterShardNodeRawFactory.build({
        hostname: hostname2,
      });

      const shard1 = clusterShardRawFactory.build(
        {},
        {
          transient: {
            slotStart: 0,
            slotEnd: 5000,
            nodes: [master1, replica1],
          },
        },
      );
      const shard2 = clusterShardRawFactory.build(
        {},
        { transient: { slotStart: 5001, slotEnd: 16383, nodes: [master2] } },
      );
      const reply = [shard1, shard2].map(toClusterShardsReplyEntry);
      when(clusterClient.sendCommand).mockResolvedValue(reply);

      const info = await service.getClusterNodesFromRedis(clusterClient);

      expect(info).toHaveLength(2);
      expect(info[0].host).toBe(hostname1);
      expect(info[1].host).toBe(hostname2);
    });

    it('should use tls-port when regular port is not available', async () => {
      const tlsPort = 6380;
      const node = clusterShardNodeRawFactory.build({
        hostname: 'redis-tls.example.com',
        port: undefined,
        'tls-port': tlsPort,
      });
      const shard = clusterShardRawFactory.build(
        {},
        { transient: { slotStart: 0, slotEnd: 16383, nodes: [node] } },
      );
      const reply = [shard].map(toClusterShardsReplyEntry);
      when(clusterClient.sendCommand).mockResolvedValue(reply);

      const info = await service.getClusterNodesFromRedis(clusterClient);

      expect(info).toHaveLength(1);
      expect(info[0].host).toBe('redis-tls.example.com');
      expect(info[0].port).toBe(tlsPort);
    });
  });

  describe('processShardNodes', () => {
    const slots = ['0-5000'];

    it('should use ip as host when hostname is empty string', () => {
      const raw = clusterShardNodeRawFactory.build();

      const result = ClusterShardsInfoStrategy.processShardNodes(
        [toNodeReplyArray(raw)],
        slots,
      );
      expect(result[0].host).toBe(raw.ip);
    });

    it('should prefer hostname over ip when hostname is set', () => {
      const hostname = 'redis.example.com';
      const raw = clusterShardNodeRawFactory.build({ hostname });

      const result = ClusterShardsInfoStrategy.processShardNodes(
        [toNodeReplyArray(raw)],
        slots,
      );
      expect(result[0].host).toBe(hostname);
    });

    it('should fall back to ip when hostname is not present in reply', () => {
      const ip = '10.0.0.99';
      const shardNodes = [
        [
          'id',
          'n1',
          'port',
          6379,
          'ip',
          ip,
          'role',
          'master',
          'health',
          'online',
        ],
      ];

      const result = ClusterShardsInfoStrategy.processShardNodes(
        shardNodes,
        slots,
      );
      expect(result[0].host).toBe(ip);
    });

    it('should use tls-port when port is missing', () => {
      const tlsPort = 6380;
      const raw = clusterShardNodeRawFactory.build({
        port: undefined,
        'tls-port': tlsPort,
      });

      const result = ClusterShardsInfoStrategy.processShardNodes(
        [toNodeReplyArray(raw)],
        slots,
      );
      expect(result[0].port).toBe(tlsPort);
      expect((result[0] as any).tlsPort).toBe(tlsPort);
    });

    it('should prefer regular port over tls-port', () => {
      const port = 6379;
      const tlsPort = 6380;
      const raw = clusterShardNodeRawFactory.build({
        port,
        'tls-port': tlsPort,
      });

      const result = ClusterShardsInfoStrategy.processShardNodes(
        [toNodeReplyArray(raw)],
        slots,
      );
      expect(result[0].port).toBe(port);
      expect((result[0] as any).tlsPort).toBe(tlsPort);
    });

    it('should assign slots to primary nodes', () => {
      const raw = clusterShardNodeRawFactory.build();

      const result = ClusterShardsInfoStrategy.processShardNodes(
        [toNodeReplyArray(raw)],
        slots,
      );
      expect(result[0].slots).toEqual(slots);
    });

    it('should map master role to primary', () => {
      const raw = clusterShardNodeRawFactory.build();

      const result = ClusterShardsInfoStrategy.processShardNodes(
        [toNodeReplyArray(raw)],
        slots,
      );
      expect(result[0].role).toBe('primary');
    });

    it('should filter out replica nodes', () => {
      const master = clusterShardNodeRawFactory.build();
      const replica = clusterShardNodeRawFactory.build({ role: 'slave' });

      const result = ClusterShardsInfoStrategy.processShardNodes(
        [toNodeReplyArray(master), toNodeReplyArray(replica)],
        slots,
      );
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(master.id);
    });

    it('should handle a TLS hostname-only cluster', () => {
      const hostname = 'cluster.redis.local';
      const tlsPort = 6390;
      const primary = clusterShardNodeRawFactory.build({
        hostname,
        port: undefined,
        'tls-port': tlsPort,
      });
      const replica = clusterShardNodeRawFactory.build({
        hostname,
        port: undefined,
        'tls-port': tlsPort + 1,
        role: 'slave',
      });

      const result = ClusterShardsInfoStrategy.processShardNodes(
        [toNodeReplyArray(primary), toNodeReplyArray(replica)],
        ['0-16383'],
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: primary.id,
          host: hostname,
          port: tlsPort,
          role: 'primary',
          slots: ['0-16383'],
        }),
      );
    });
  });

  describe('calculateSlots', () => {
    it('should format slot ranges', () => {
      expect(ClusterShardsInfoStrategy.calculateSlots([0, 5000])).toEqual([
        '0-5000',
      ]);
    });

    it('should format single slot as standalone value', () => {
      const slot = 100;
      expect(ClusterShardsInfoStrategy.calculateSlots([slot, slot])).toEqual([
        `${slot}`,
      ]);
    });

    it('should handle multiple slot ranges', () => {
      expect(
        ClusterShardsInfoStrategy.calculateSlots([0, 5000, 5001, 10000]),
      ).toEqual(['0-5000', '5001-10000']);
    });

    it('should handle mixed ranges and single slots', () => {
      expect(
        ClusterShardsInfoStrategy.calculateSlots([
          0, 5000, 10922, 10922, 10923, 16383,
        ]),
      ).toEqual(['0-5000', '10922', '10923-16383']);
    });
  });
});
