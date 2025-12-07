import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import {
  mockClientMetadata,
  mockStandaloneRedisClient,
  mockClusterRedisClient,
  mockStandaloneRedisInfoReply,
} from 'src/__mocks__';
import { DatabaseOverview } from 'src/modules/database/models/database-overview';
import { DatabaseOverviewProvider } from 'src/modules/database/providers/database-overview.provider';
import * as Utils from 'src/modules/redis/utils/keys.util';
import { DatabaseOverviewKeyspace } from 'src/modules/database/constants/overview';
import { convertRedisInfoReplyToObject } from 'src/utils';

const mockServerInfo = {
  redis_version: '6.2.4',
  uptime_in_seconds: '1',
};
const mockReplicationInfo = {
  role: 'master',
};
const mockMemoryInfo = {
  used_memory: '1',
};
const mockStatsInfo = {
  instantaneous_ops_per_sec: '1',
  instantaneous_input_kbps: '1',
  instantaneous_output_kbps: '1',
};
const mockCpu = {
  used_cpu_sys: '1',
  used_cpu_user: '1',
};
const standaloneClientsInfo = {
  connected_clients: '1',
};
const mockCurrentKeyspace = DatabaseOverviewKeyspace.Current;
const mockKeyspace = {
  db0: 'keys=1,expires=0,avg_ttl=0',
  db1: 'keys=0,expires=0,avg_ttl=0',
  db2: 'keys=1,expires=0,avg_ttl=0',
};
const mockNodeInfo = {
  host: 'localhost',
  port: 6379,
  server: mockServerInfo,
  replication: mockReplicationInfo,
  stats: mockStatsInfo,
  memory: mockMemoryInfo,
  cpu: mockCpu,
  clients: standaloneClientsInfo,
  keyspace: mockKeyspace,
};

const mockGetTotalResponse1 = 1;

export const mockDatabaseOverview: DatabaseOverview = {
  version: mockServerInfo.redis_version,
  serverName: null,
  usedMemory: 1,
  totalKeys: 2,
  totalKeysPerDb: {
    db0: 1,
  },
  connectedClients: 1,
  opsPerSecond: 1,
  networkInKbps: 1,
  networkOutKbps: 1,
  cpuUsagePercentage: null,
};

describe('OverviewService', () => {
  const standaloneClient = mockStandaloneRedisClient;
  const clusterClient = mockClusterRedisClient;
  let service: DatabaseOverviewProvider;
  let spyGetNodeInfo;
  let spyCalculateTotalKeys;
  let spyCalculateNodesTotalKeys;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DatabaseOverviewProvider],
    }).compile();

    service = await module.get(DatabaseOverviewProvider);
    spyGetNodeInfo = jest.spyOn<any, any>(service, 'getNodeInfo');
    spyCalculateTotalKeys = jest.spyOn<any, any>(service, 'calculateTotalKeys');
    spyCalculateNodesTotalKeys = jest.spyOn<any, any>(
      service,
      'calculateNodesTotalKeys',
    );
    standaloneClient.call = jest.fn();
    standaloneClient.sendCommand = jest.fn();
  });

  describe('getOverview', () => {
    describe('Standalone', () => {
      it('should return proper overview', async () => {
        when(standaloneClient.getInfo).mockResolvedValue(
          convertRedisInfoReplyToObject(mockStandaloneRedisInfoReply),
        );
        const result = await service.getOverview(
          mockClientMetadata,
          standaloneClient,
          mockCurrentKeyspace,
        );

        expect(result).toEqual({
          ...mockDatabaseOverview,
          version: '6.0.5',
          connectedClients: 1,
          totalKeys: 1,
          totalKeysPerDb: undefined,
          usedMemory: 1000000,
          cpuUsagePercentage: undefined,
          opsPerSecond: undefined,
          networkInKbps: undefined,
          networkOutKbps: undefined,
        });
      });
      it('should return overview with serverName if server_name is present in redis info', async () => {
        const redisInfoReplyWithServerName = `${mockStandaloneRedisInfoReply.slice(0, 11)}server_name:valkey\r\n${mockStandaloneRedisInfoReply.slice(11)}`;
        when(standaloneClient.getInfo).mockResolvedValue(
          convertRedisInfoReplyToObject(redisInfoReplyWithServerName),
        );
        const result = await service.getOverview(
          mockClientMetadata,
          standaloneClient,
          mockCurrentKeyspace,
        );

        expect(result).toEqual({
          ...mockDatabaseOverview,
          version: '6.0.5',
          serverName: 'valkey',
          connectedClients: 1,
          totalKeys: 1,
          totalKeysPerDb: undefined,
          usedMemory: 1000000,
          cpuUsagePercentage: undefined,
          opsPerSecond: undefined,
          networkInKbps: undefined,
          networkOutKbps: undefined,
        });
      });
      it('should return total 0 and empty total per db object', async () => {
        spyGetNodeInfo.mockResolvedValueOnce({
          ...mockNodeInfo,
          keyspace: {
            db0: 'keys=0,expires=0,avg_ttl=0',
          },
        });

        expect(
          await service.getOverview(
            mockClientMetadata,
            standaloneClient,
            mockCurrentKeyspace,
          ),
        ).toEqual({
          ...mockDatabaseOverview,
          totalKeys: 0,
          totalKeysPerDb: undefined,
        });
      });
      it('should return total 3 and empty total per db object (even when role is not master)', async () => {
        spyGetNodeInfo.mockResolvedValueOnce({
          ...mockNodeInfo,
          replication: {
            role: 'slave',
          },
          keyspace: {
            db0: 'keys=3,expires=0,avg_ttl=0',
          },
        });

        expect(
          await service.getOverview(
            mockClientMetadata,
            standaloneClient,
            mockCurrentKeyspace,
          ),
        ).toEqual({
          ...mockDatabaseOverview,
          totalKeys: 3,
          totalKeysPerDb: undefined,
        });
      });
      it('should not return particular fields when metrics are not available', async () => {
        spyGetNodeInfo.mockResolvedValueOnce({
          ...mockNodeInfo,
          replication: {
            role: 'slave',
          },
          keyspace: undefined,
          memory: undefined,
          clients: undefined,
        });

        expect(
          await service.getOverview(
            mockClientMetadata,
            standaloneClient,
            mockCurrentKeyspace,
          ),
        ).toEqual({
          ...mockDatabaseOverview,
          totalKeys: undefined,
          usedMemory: undefined,
          totalKeysPerDb: undefined,
          connectedClients: undefined,
        });
      });
      it('check for cpu on second attempt', async () => {
        spyGetNodeInfo.mockResolvedValueOnce(mockNodeInfo);
        spyGetNodeInfo.mockResolvedValueOnce({
          ...mockNodeInfo,
          server: {
            ...mockNodeInfo.server,
            uptime_in_seconds: '3',
          },
          cpu: {
            ...mockNodeInfo.cpu,
            used_cpu_sys: '1.5',
            used_cpu_user: '1.5',
          },
        });

        expect(
          await service.getOverview(
            mockClientMetadata,
            standaloneClient,
            mockCurrentKeyspace,
          ),
        ).toEqual({
          ...mockDatabaseOverview,
        });

        expect(
          await service.getOverview(
            mockClientMetadata,
            standaloneClient,
            mockCurrentKeyspace,
          ),
        ).toEqual({
          ...mockDatabaseOverview,
          cpuUsagePercentage: 50,
        });
      });
      it('check for cpu max value = 100', async () => {
        spyGetNodeInfo.mockResolvedValueOnce(mockNodeInfo);
        spyGetNodeInfo.mockResolvedValueOnce({
          ...mockNodeInfo,
          server: {
            ...mockNodeInfo.server,
            uptime_in_seconds: '2',
          },
          cpu: {
            ...mockNodeInfo.cpu,
            used_cpu_sys: '1.51',
            used_cpu_user: '1.50002',
          },
        });

        expect(
          await service.getOverview(
            mockClientMetadata,
            standaloneClient,
            mockCurrentKeyspace,
          ),
        ).toEqual({
          ...mockDatabaseOverview,
        });

        expect(
          await service.getOverview(
            mockClientMetadata,
            standaloneClient,
            mockCurrentKeyspace,
          ),
        ).toEqual({
          ...mockDatabaseOverview,
          cpuUsagePercentage: 100,
        });
      });
      it('should not return cpu (undefined) when used_cpu_sys = 0', async () => {
        spyGetNodeInfo.mockResolvedValueOnce({
          ...mockNodeInfo,
          server: {
            ...mockNodeInfo.server,
            uptime_in_seconds: '2',
          },
          cpu: {
            ...mockNodeInfo.cpu,
            used_cpu_sys: '0',
            used_cpu_user: '1.50002',
          },
        });

        expect(
          await service.getOverview(
            mockClientMetadata,
            standaloneClient,
            mockCurrentKeyspace,
          ),
        ).toEqual({
          ...mockDatabaseOverview,
          cpuUsagePercentage: undefined,
        });
      });
      it('should full data of keyspace if query keyspace = "full" ', async () => {
        spyGetNodeInfo.mockResolvedValueOnce(mockNodeInfo);

        expect(
          await service.getOverview(
            mockClientMetadata,
            standaloneClient,
            DatabaseOverviewKeyspace.Full,
          ),
        ).toEqual({
          ...mockDatabaseOverview,
          totalKeysPerDb: {
            db0: 1,
            db1: 0,
            db2: 1,
          },
        });
      });
    });
    describe('Cluster', () => {
      it('Should calculate overview and ignore replica where needed', async () => {
        const getTotal = jest
          .spyOn(Utils, 'getTotalKeys')
          .mockResolvedValue(mockGetTotalResponse1);
        clusterClient.nodes = jest
          .fn()
          .mockReturnValue(new Array(6).fill(Promise.resolve()));

        spyGetNodeInfo.mockResolvedValueOnce({
          ...mockNodeInfo,
          port: 12001,
        });
        spyGetNodeInfo.mockResolvedValueOnce({
          ...mockNodeInfo,
          port: 12002,
        });
        spyGetNodeInfo.mockResolvedValueOnce({
          ...mockNodeInfo,
          port: 12003,
        });
        spyGetNodeInfo.mockResolvedValueOnce({
          ...mockNodeInfo,
          port: 12004,
          replication: { role: 'slave' },
        });
        spyGetNodeInfo.mockResolvedValueOnce({
          ...mockNodeInfo,
          port: 12005,
          replication: { role: 'slave' },
        });
        spyGetNodeInfo.mockResolvedValueOnce({
          ...mockNodeInfo,
          port: 12006,
          replication: { role: 'slave' },
        });

        expect(
          await service.getOverview(
            mockClientMetadata,
            clusterClient,
            mockCurrentKeyspace,
          ),
        ).toEqual({
          ...mockDatabaseOverview,
          connectedClients: 1,
          totalKeys: 6,
          totalKeysPerDb: undefined,
          usedMemory: 3,
          networkInKbps: 6,
          networkOutKbps: 6,
          opsPerSecond: 6,
          cpuUsagePercentage: null,
        });
        expect(spyCalculateTotalKeys).toHaveBeenCalledTimes(0);
        expect(spyCalculateNodesTotalKeys).toHaveBeenCalledTimes(1);
        expect(getTotal).toHaveBeenCalledTimes(6); // 6 nodes

        spyGetNodeInfo.mockResolvedValueOnce({
          ...mockNodeInfo,
          port: 12001,
          server: { ...mockNodeInfo.server, uptime_in_seconds: '3' },
          cpu: {
            ...mockNodeInfo.cpu,
            used_cpu_sys: '1.5',
            used_cpu_user: '1.5',
          },
        });
        spyGetNodeInfo.mockResolvedValueOnce({
          ...mockNodeInfo,
          port: 12002,
          server: { ...mockNodeInfo.server, uptime_in_seconds: '3' },
          cpu: {
            ...mockNodeInfo.cpu,
            used_cpu_sys: '1.5',
            used_cpu_user: '1.5',
          },
        });
        spyGetNodeInfo.mockResolvedValueOnce({
          ...mockNodeInfo,
          port: 12003,
          server: { ...mockNodeInfo.server, uptime_in_seconds: '3' },
          cpu: {
            ...mockNodeInfo.cpu,
            used_cpu_sys: '1.5',
            used_cpu_user: '1.5',
          },
        });
        spyGetNodeInfo.mockResolvedValueOnce({
          ...mockNodeInfo,
          port: 12004,
          replication: { role: 'slave' },
          server: { ...mockNodeInfo.server, uptime_in_seconds: '3' },
          cpu: {
            ...mockNodeInfo.cpu,
            used_cpu_sys: '1.5',
            used_cpu_user: '1.5',
          },
        });
        spyGetNodeInfo.mockResolvedValueOnce({
          ...mockNodeInfo,
          port: 12005,
          replication: { role: 'slave' },
          server: { ...mockNodeInfo.server, uptime_in_seconds: '3' },
          cpu: {
            ...mockNodeInfo.cpu,
            used_cpu_sys: '1.5',
            used_cpu_user: '1.5',
          },
        });
        spyGetNodeInfo.mockResolvedValueOnce({
          ...mockNodeInfo,
          port: 12006,
          replication: { role: 'slave' },
          server: { ...mockNodeInfo.server, uptime_in_seconds: '3' },
          cpu: {
            ...mockNodeInfo.cpu,
            used_cpu_sys: '1.5',
            used_cpu_user: '1.5',
          },
        });

        expect(
          await service.getOverview(
            mockClientMetadata,
            clusterClient,
            mockCurrentKeyspace,
          ),
        ).toEqual({
          ...mockDatabaseOverview,
          connectedClients: 1,
          totalKeys: 6,
          totalKeysPerDb: undefined,
          usedMemory: 3,
          networkInKbps: 6,
          networkOutKbps: 6,
          opsPerSecond: 6,
          cpuUsagePercentage: 300,
        });
      });
    });
  });
});
