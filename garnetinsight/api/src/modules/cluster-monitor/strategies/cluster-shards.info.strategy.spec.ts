import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import { ClusterShardsInfoStrategy } from 'src/modules/cluster-monitor/strategies/cluster-shards.info.strategy';
import { mockClusterRedisClient } from 'src/__mocks__';

const clusterClient = mockClusterRedisClient;

const m1 = {
  id: 'm1',
  health: 'online',
  host: '172.30.100.1',
  primary: undefined,
  port: 6379,
  role: 'primary',
  slots: ['0-5000'],
};
const m2 = {
  id: 'm2',
  health: 'loading',
  host: '172.30.100.4',
  primary: undefined,
  port: 6379,
  role: 'primary',
  slots: ['5001-10921', '10922'],
};
const m3 = {
  id: 'm3',
  health: 'offline',
  host: '172.30.100.7',
  primary: undefined,
  port: 6379,
  role: 'primary',
  slots: ['10923-16383'],
};

const mockClusterShardsReply = [
  [
    'slots',
    [0, 5000],
    'nodes',
    [
      [
        'id',
        'm1',
        'port',
        6379,
        'ip',
        '172.30.100.1',
        'endpoint',
        '172.30.100.212',
        'hostname',
        '',
        'role',
        'master',
        'replication-offset',
        107870,
        'health',
        'online',
      ],
      [
        'id',
        's11',
        'port',
        6379,
        'ip',
        '172.30.100.2',
        'endpoint',
        '172.30.100.212',
        'hostname',
        '',
        'role',
        'slave',
        'replication-offset',
        107870,
        'health',
        'online',
      ],
    ],
  ],
  [
    'slots',
    [5001, 10921, 10922, 10922],
    'nodes',
    [
      [
        'id',
        'm2',
        'port',
        6379,
        'ip',
        '172.30.100.4',
        'endpoint',
        '172.30.100.212',
        'hostname',
        '',
        'role',
        'master',
        'replication-offset',
        107870,
        'health',
        'loading',
      ],
      [
        'id',
        's21',
        'port',
        6379,
        'ip',
        '172.30.100.5',
        'endpoint',
        '172.30.100.212',
        'hostname',
        '',
        'role',
        'slave',
        'replication-offset',
        107870,
        'health',
        'online',
      ],
    ],
  ],
  [
    'slots',
    [10923, 16383],
    'nodes',
    [
      [
        'id',
        'm3',
        'port',
        6379,
        'ip',
        '172.30.100.7',
        'endpoint',
        '172.30.100.212',
        'hostname',
        '',
        'role',
        'master',
        'replication-offset',
        107870,
        'health',
        'offline',
      ],
      [
        'id',
        's31',
        'port',
        6379,
        'ip',
        '172.30.100.8',
        'endpoint',
        '172.30.100.212',
        'hostname',
        '',
        'role',
        'slave',
        'replication-offset',
        107870,
        'health',
        'online',
      ],
    ],
  ],
];

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
    beforeEach(() => {
      when(clusterClient.sendCommand).mockResolvedValue(mockClusterShardsReply);
    });
    it('should return cluster info', async () => {
      const info = await service.getClusterNodesFromRedis(clusterClient);
      expect(info).toEqual([m1, m2, m3]);
    });
  });
});
