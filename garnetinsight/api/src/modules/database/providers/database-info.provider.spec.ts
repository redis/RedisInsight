import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import {
  mockFeatureService,
  mockRedisClientList,
  mockRedisClientListResult,
  mockRedisClientsInfoResponse,
  mockRedisServerInfoResponse,
  mockStandaloneRedisInfoReply,
  MockType,
  mockStandaloneRedisClient,
  mockClusterRedisClient,
} from 'src/__mocks__';
import {
  REDIS_MODULES_COMMANDS,
  AdditionalRedisModuleName,
} from 'src/constants';
import { RedisDatabaseInfoResponse } from 'src/modules/database/dto/redis-info.dto';
import {
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { FeatureService } from 'src/modules/feature/feature.service';
import { DatabaseInfoProvider } from 'src/modules/database/providers/database-info.provider';
import { convertRedisInfoReplyToObject } from 'src/utils';

const mockRedisServerInfoDto = {
  redis_version: '6.0.5',
  redis_mode: 'standalone',
  os: 'Linux 4.15.0-1087-gcp x86_64',
  arch_bits: '64',
  tcp_port: '11113',
  uptime_in_seconds: '1000',
};
const mockRedisStatsDto = {
  instantaneous_input_kbps: undefined,
  instantaneous_ops_per_sec: undefined,
  instantaneous_output_kbps: undefined,
  maxmemory_policy: undefined,
  numberOfKeysRange: '0 - 500 000',
  uptime_in_days: undefined,
};

const mockRedisGeneralInfo: RedisDatabaseInfoResponse = {
  version: mockRedisServerInfoDto.redis_version,
  databases: 16,
  role: 'master',
  server: mockRedisServerInfoDto,
  stats: mockRedisStatsDto,
  usedMemory: 1000000,
  totalKeys: 1,
  connectedClients: 1,
  uptimeInSeconds: 1000,
  hitRatio: 1,
};

const mockRedisModuleList = [
  { name: 'ai', ver: 10000 },
  { name: 'graph', ver: 10000 },
  { name: 'rg', ver: 10000 },
  { name: 'bf', ver: 10000 },
  { name: 'ReJSON', ver: 10000 },
  { name: 'search', ver: 10000 },
  { name: 'timeseries', ver: 10000 },
  { name: 'customModule', ver: 10000 },
].map((item) => [].concat(...Object.entries(item)));

const mockUnknownCommandModule = new Error("unknown command 'module'");

describe('DatabaseInfoProvider', () => {
  const standaloneClient = mockStandaloneRedisClient;
  const clusterClient = mockClusterRedisClient;
  let service: DatabaseInfoProvider;
  let featureService: MockType<FeatureService>;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseInfoProvider,
        {
          provide: FeatureService,
          useFactory: mockFeatureService,
        },
      ],
    }).compile();

    service = await module.get(DatabaseInfoProvider);
    featureService = await module.get(FeatureService);
  });

  describe('getDatabasesCount', () => {
    it('get databases count', async () => {
      when(standaloneClient.call)
        .calledWith(['config', 'get', 'databases'], expect.anything())
        .mockResolvedValue(['databases', '16']);

      const result = await service.getDatabasesCount(standaloneClient);

      expect(result).toBe(16);
    });
    it('get databases count for limited redis db', async () => {
      when(standaloneClient.call)
        .calledWith(['config', 'get', 'databases'], expect.anything())
        .mockResolvedValue([]);

      const result = await service.getDatabasesCount(standaloneClient);

      expect(result).toBe(1);
    });
    it('failed to get databases config', async () => {
      when(standaloneClient.call)
        .calledWith(['config', 'get', 'databases'], expect.anything())
        .mockRejectedValue(new Error("unknown command 'config'"));

      const result = await service.getDatabasesCount(standaloneClient);

      expect(result).toBe(1);
    });
  });

  describe('getClientListInfo', () => {
    it('get client list info', async () => {
      when(standaloneClient.call)
        .calledWith(['client', 'list'], expect.anything())
        .mockResolvedValue(mockRedisClientList);

      const result = await service.getClientListInfo(standaloneClient);

      expect(result).toEqual(mockRedisClientListResult);
    });
    it('failed to get client list', async () => {
      when(standaloneClient.call)
        .calledWith(['client', 'list'], expect.anything())
        .mockRejectedValue(new Error("unknown command 'client'"));

      try {
        await service.getClientListInfo(standaloneClient);
      } catch (err) {
        expect(err).toBeInstanceOf(InternalServerErrorException);
      }
    });
  });

  describe('getDatabaseCountFromKeyspace', () => {
    it('should return 1 since db0 keys presented only', async () => {
      const result = await service['getDatabaseCountFromKeyspace']({
        db0: 'keys=11,expires=0,avg_ttl=0',
      });

      expect(result).toBe(1);
    });
    it('should return 7 since db6 is the last logical databases with known keys', async () => {
      const result = await service['getDatabaseCountFromKeyspace']({
        db0: 'keys=21,expires=0,avg_ttl=0',
        db1: 'keys=31,expires=0,avg_ttl=0',
        db6: 'keys=41,expires=0,avg_ttl=0',
      });

      expect(result).toBe(7);
    });
    it('should return 1 when empty keySpace provided', async () => {
      const result = await service['getDatabaseCountFromKeyspace']({});

      expect(result).toBe(1);
    });
    it('should return 1 when incorrect keySpace provided', async () => {
      const result = await service['getDatabaseCountFromKeyspace'](null);

      expect(result).toBe(1);
    });
  });

  describe('determineDatabaseModules', () => {
    it('get modules by using MODULE LIST command (without filters)', async () => {
      when(standaloneClient.call)
        .calledWith(['module', 'list'], expect.anything())
        .mockResolvedValue(mockRedisModuleList);

      const result = await service.determineDatabaseModules(standaloneClient);

      expect(standaloneClient.call).not.toHaveBeenCalledWith(
        'command',
        expect.anything(),
      );
      expect(result).toEqual([
        {
          name: AdditionalRedisModuleName.RedisAI,
          version: 10000,
          semanticVersion: '1.0.0',
        },
        {
          name: AdditionalRedisModuleName.RedisGraph,
          version: 10000,
          semanticVersion: '1.0.0',
        },
        {
          name: AdditionalRedisModuleName.RedisGears,
          version: 10000,
          semanticVersion: '1.0.0',
        },
        {
          name: AdditionalRedisModuleName.RedisBloom,
          version: 10000,
          semanticVersion: '1.0.0',
        },
        {
          name: AdditionalRedisModuleName.RedisJSON,
          version: 10000,
          semanticVersion: '1.0.0',
        },
        {
          name: AdditionalRedisModuleName.RediSearch,
          version: 10000,
          semanticVersion: '1.0.0',
        },
        {
          name: AdditionalRedisModuleName.RedisTimeSeries,
          version: 10000,
          semanticVersion: '1.0.0',
        },
        { name: 'customModule', version: 10000, semanticVersion: undefined },
      ]);
    });
    it('get modules by using MODULE LIST command (with filters applied)', async () => {
      when(standaloneClient.call)
        .calledWith(['module', 'list'], expect.anything())
        .mockResolvedValue(mockRedisModuleList);
      featureService.getByName.mockResolvedValue({
        flag: true,
        data: {
          hideByName: [
            {
              expression: 'rejSoN',
              options: 'i',
            },
          ],
        },
      });

      const result = await service.determineDatabaseModules(standaloneClient);

      expect(standaloneClient.call).not.toHaveBeenCalledWith(
        'command',
        expect.anything(),
      );
      expect(result).toEqual([
        {
          name: AdditionalRedisModuleName.RedisAI,
          version: 10000,
          semanticVersion: '1.0.0',
        },
        {
          name: AdditionalRedisModuleName.RedisGraph,
          version: 10000,
          semanticVersion: '1.0.0',
        },
        {
          name: AdditionalRedisModuleName.RedisGears,
          version: 10000,
          semanticVersion: '1.0.0',
        },
        {
          name: AdditionalRedisModuleName.RedisBloom,
          version: 10000,
          semanticVersion: '1.0.0',
        },
        // { name: AdditionalRedisModuleName.RedisJSON, version: 10000, semanticVersion: '1.0.0' }, should be ignored
        {
          name: AdditionalRedisModuleName.RediSearch,
          version: 10000,
          semanticVersion: '1.0.0',
        },
        {
          name: AdditionalRedisModuleName.RedisTimeSeries,
          version: 10000,
          semanticVersion: '1.0.0',
        },
        { name: 'customModule', version: 10000, semanticVersion: undefined },
      ]);
    });
    it('detect all modules by using COMMAND INFO command (without filter)', async () => {
      when(standaloneClient.call)
        .calledWith(['module', 'list'], expect.anything())
        .mockRejectedValue(mockUnknownCommandModule);
      when(standaloneClient.call)
        .calledWith(
          expect.arrayContaining(['command', 'info']),
          expect.anything(),
        )
        .mockResolvedValue([
          null,
          ['somecommand', -1, ['readonly'], 0, 0, -1, []],
        ]);

      const result = await service.determineDatabaseModules(standaloneClient);

      expect(standaloneClient.call).toHaveBeenCalledTimes(
        REDIS_MODULES_COMMANDS.size + 1,
      );
      expect(result).toEqual([
        { name: AdditionalRedisModuleName.RedisAI },
        { name: AdditionalRedisModuleName.RedisGraph },
        { name: AdditionalRedisModuleName.RedisGears },
        { name: AdditionalRedisModuleName.RedisBloom },
        { name: AdditionalRedisModuleName.RedisJSON },
        { name: AdditionalRedisModuleName.RediSearch },
        { name: AdditionalRedisModuleName.RedisTimeSeries },
      ]);
    });
    it('detect all modules by using COMMAND INFO command (with filter)', async () => {
      when(standaloneClient.call)
        .calledWith(['module', 'list'], expect.anything())
        .mockRejectedValue(mockUnknownCommandModule);
      when(standaloneClient.call)
        .calledWith(
          expect.arrayContaining(['command', 'info']),
          expect.anything(),
        )
        .mockResolvedValue([
          null,
          ['somecommand', -1, ['readonly'], 0, 0, -1, []],
        ]);
      featureService.getByName.mockResolvedValue({
        flag: true,
        data: {
          hideByName: [
            {
              expression: 'rejSoN',
              options: 'i',
            },
          ],
        },
      });

      const result = await service.determineDatabaseModules(standaloneClient);

      expect(standaloneClient.call).toHaveBeenCalledTimes(
        REDIS_MODULES_COMMANDS.size + 1,
      );
      expect(result).toEqual([
        { name: AdditionalRedisModuleName.RedisAI },
        { name: AdditionalRedisModuleName.RedisGraph },
        { name: AdditionalRedisModuleName.RedisGears },
        { name: AdditionalRedisModuleName.RedisBloom },
        // { name: AdditionalRedisModuleName.RedisJSON }, should be ignored
        { name: AdditionalRedisModuleName.RediSearch },
        { name: AdditionalRedisModuleName.RedisTimeSeries },
      ]);
    });
    it('detect only RediSearch module by using COMMAND INFO command', async () => {
      when(standaloneClient.call)
        .calledWith(['module', 'list'], expect.anything())
        .mockRejectedValue(mockUnknownCommandModule);
      when(standaloneClient.call)
        .calledWith(
          [
            'command',
            'info',
            ...REDIS_MODULES_COMMANDS.get(AdditionalRedisModuleName.RediSearch),
          ],
          expect.anything(),
        )
        .mockResolvedValue([['FT.INFO', -1, ['readonly'], 0, 0, -1, []]]);

      const result = await service.determineDatabaseModules(standaloneClient);

      expect(standaloneClient.call).toHaveBeenCalledTimes(
        REDIS_MODULES_COMMANDS.size + 1,
      );
      expect(result).toEqual([{ name: AdditionalRedisModuleName.RediSearch }]);
    });
    it('should return empty array if MODULE LIST and COMMAND command not allowed', async () => {
      when(standaloneClient.call)
        .calledWith(['module', 'list'], expect.anything())
        .mockRejectedValue(mockUnknownCommandModule);
      when(standaloneClient.call)
        .calledWith(
          expect.arrayContaining(['command', 'info']),
          expect.anything(),
        )
        .mockRejectedValue(mockUnknownCommandModule);

      const result = await service.determineDatabaseModules(standaloneClient);

      expect(result).toEqual([]);
    });
  });

  describe('determineDatabaseServer', () => {
    it('get modules by using MODULE LIST command', async () => {
      when(standaloneClient.getInfo).mockResolvedValue(
        convertRedisInfoReplyToObject(mockRedisServerInfoResponse),
      );

      const result = await service.determineDatabaseServer(standaloneClient);

      expect(result).toEqual(mockRedisGeneralInfo.version);
    });
  });

  describe('getRedisDBSize', () => {
    it('get dbsize for redis standalone', async () => {
      when(standaloneClient.sendCommand)
        .calledWith(['dbsize'], { replyEncoding: 'utf8' })
        .mockResolvedValue('1');

      const result = await service.getRedisDBSize(standaloneClient);
      expect(result).toEqual(1);
    });

    it('get general info for redis cluster', async () => {
      clusterClient.nodes.mockResolvedValueOnce([
        standaloneClient,
        standaloneClient,
      ]);
      when(standaloneClient.sendCommand)
        .calledWith(['dbsize'], { replyEncoding: 'utf8' })
        .mockResolvedValueOnce('1')
        .mockResolvedValueOnce('2');

      const result = await service.getRedisDBSize(clusterClient);

      expect(result).toEqual(3);
    });
  });

  describe('getRedisGeneralInfo', () => {
    beforeEach(() => {
      service.getDatabasesCount = jest.fn().mockResolvedValue(16);
    });
    it('get general info for redis standalone', async () => {
      when(standaloneClient.getInfo).mockResolvedValue(
        convertRedisInfoReplyToObject(mockStandaloneRedisInfoReply),
      );

      const result = await service.getRedisGeneralInfo(standaloneClient);

      expect(result).toEqual(mockRedisGeneralInfo);
    });
    it('get general info for redis standalone without some optional fields', async () => {
      const reply: string = `${mockRedisServerInfoResponse}\r\n${
        mockRedisClientsInfoResponse
      }\r\n`;
      when(standaloneClient.getInfo).mockResolvedValue(
        convertRedisInfoReplyToObject(reply),
      );

      const result = await service.getRedisGeneralInfo(standaloneClient);

      expect(result).toEqual({
        ...mockRedisGeneralInfo,
        stats: {
          ...mockRedisStatsDto,
          numberOfKeysRange: undefined,
        },
        totalKeys: undefined,
        usedMemory: undefined,
        hitRatio: undefined,
        role: undefined,
      });
    });
    it('get general info for redis cluster', async () => {
      clusterClient.nodes.mockResolvedValueOnce([
        standaloneClient,
        standaloneClient,
      ]);
      when(standaloneClient.getInfo).mockResolvedValue(
        convertRedisInfoReplyToObject(mockStandaloneRedisInfoReply),
      );

      const result = await service.getRedisGeneralInfo(clusterClient);

      expect(result).toEqual({
        version: mockRedisGeneralInfo.version,
        totalKeys: mockRedisGeneralInfo.totalKeys * 2,
        usedMemory: mockRedisGeneralInfo.usedMemory * 2,
        nodes: [mockRedisGeneralInfo, mockRedisGeneralInfo],
      });
    });
    it('should get info from hello command when info command is not available', async () => {
      when(standaloneClient.getInfo).mockResolvedValue({
        replication: {
          role: mockRedisGeneralInfo.role,
        },
        server: {
          redis_mode: mockRedisServerInfoDto.redis_mode,
          redis_version: mockRedisGeneralInfo.version,
          server_name: 'redis',
        },
      });

      const result = await service.getRedisGeneralInfo(standaloneClient);

      expect(result).toEqual({
        ...mockRedisGeneralInfo,
        stats: {
          ...mockRedisStatsDto,
          numberOfKeysRange: undefined,
        },
        server: {
          redis_mode: mockRedisServerInfoDto.redis_mode,
          redis_version: mockRedisGeneralInfo.version,
          server_name: 'redis',
        },
        uptimeInSeconds: undefined,
        totalKeys: undefined,
        usedMemory: undefined,
        hitRatio: undefined,
        connectedClients: undefined,
        cashedScripts: undefined,
      });
    });
    it("should throw an error if no permission to run 'info' and 'hello' commands", async () => {
      when(standaloneClient.getInfo).mockRejectedValue({
        message:
          "NOPERM this user has no permissions to run the 'hello' command",
      });

      try {
        await service.getRedisGeneralInfo(standaloneClient);
        fail('Should throw an error');
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenException);
      }
    });
  });
});
