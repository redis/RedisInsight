import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import { ClusterNodesInfoStrategy } from 'src/modules/cluster-monitor/strategies/cluster-nodes.info.strategy';
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

const mockClusterNodesReply =
  '' +
  'm1 172.30.100.1:6379@16379 master - 0 1661415706000 2 connected 0-5000\n' +
  's11 172.30.100.2:6379@16379 slave m1 0 1661415705000 3 connected\n' +
  's12 172.30.100.3:6379@16379 slave m1 0 1661415705000 3 connected\n' +
  'm2 172.30.100.4:6379@16379 myself,pfail - 0 1661415702000 1 connected 5001-10921 10922\n' +
  's21 172.30.100.5:6379@16379 slave m2 0 1661415704000 2 connected\n' +
  's22 172.30.100.6:6379@16379 slave m2 0 1661415705230 2 connected\n' +
  'm3 172.30.100.7:6379@16379 master,fail - 0 1661415702000 1 connected 10923-16383\n' +
  's31 172.30.100.8:6379@16379 slave m3 0 1661415704000 2 connected\n' +
  's32 172.30.100.9:6379@16379 slave m3 0 1661415705230 2 connected\n';

describe('ClusterNodesInfoStrategy', () => {
  let service: ClusterNodesInfoStrategy;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [ClusterNodesInfoStrategy],
    }).compile();

    service = module.get(ClusterNodesInfoStrategy);
  });

  describe('getClusterNodesFromRedis', () => {
    beforeEach(() => {
      when(clusterClient.sendCommand).mockResolvedValue(mockClusterNodesReply);
    });
    it('should return cluster info', async () => {
      const info = await service.getClusterNodesFromRedis(clusterClient);
      expect(info).toEqual([m1, m2, m3]);
    });
  });
});
