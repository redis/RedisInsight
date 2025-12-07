import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import { KeysScanner } from 'src/modules/database-analysis/scanner/keys-scanner';
import { KeyInfoProvider } from 'src/modules/database-analysis/scanner/key-info/key-info.provider';
import { mockCreateDatabaseAnalysisDto } from 'src/modules/database-analysis/providers/database-analysis.provider.spec';
import * as Utils from 'src/modules/redis/utils/keys.util';
import {
  mockClusterRedisClient,
  mockStandaloneRedisClient,
} from 'src/__mocks__';

const standaloneClient = mockStandaloneRedisClient;
const clusterClient = mockClusterRedisClient;

const mockInfoStrategy = () => ({
  getLength: jest.fn(),
  getLengthSafe: jest.fn(),
});

const mockKeyInfoProvider = () => ({
  getStrategy: jest.fn(),
});

const mockGetTotalResponse = 1;

const mockKey = {
  name: Buffer.from('key'),
  type: 'string',
  ttl: -1,
  memory: 10,
  length: 2,
};

const mockIndex = 'idx';

const mockScanResult = {
  keys: [mockKey],
  indexes: [mockIndex],
  progress: {
    processed: 1,
    scanned: 15,
    total: 1,
  },
  client: Object.assign(standaloneClient),
};

describe('KeysScanner', () => {
  let service: KeysScanner;
  let infoProvider;
  let infoStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KeysScanner,
        {
          provide: KeyInfoProvider,
          useFactory: mockKeyInfoProvider,
        },
      ],
    }).compile();

    service = module.get<KeysScanner>(KeysScanner);
    infoProvider = module.get<KeyInfoProvider>(KeyInfoProvider);
    infoStrategy = mockInfoStrategy();
    infoProvider.getStrategy.mockReturnValue(infoStrategy);
    infoStrategy.getLengthSafe.mockResolvedValue(2);
    clusterClient.nodes.mockReturnValue([
      standaloneClient,
      standaloneClient,
      standaloneClient,
    ]);
    when(standaloneClient.sendCommand)
      .calledWith(expect.arrayContaining(['scan']))
      .mockResolvedValue(['0', [mockKey.name]]);
    when(standaloneClient.sendPipeline)
      .calledWith(expect.arrayContaining([expect.arrayContaining(['memory'])]))
      .mockReturnValue([[null, 10]]);
    when(standaloneClient.sendPipeline)
      .calledWith(expect.arrayContaining([expect.arrayContaining(['ttl'])]))
      .mockReturnValue([[null, -1]]);
    when(standaloneClient.sendPipeline)
      .calledWith(
        expect.arrayContaining([expect.arrayContaining(['type'])]),
        expect.anything(),
      )
      .mockReturnValue([[null, 'string']]);
    when(standaloneClient.sendCommand)
      .calledWith(['FT._LIST'], expect.anything())
      .mockResolvedValue([mockIndex]);
  });

  describe('scan', () => {
    it('should scan standalone database', async () => {
      jest.spyOn(Utils, 'getTotalKeys').mockResolvedValue(mockGetTotalResponse);
      expect(
        await service.scan(standaloneClient, {
          filter: mockCreateDatabaseAnalysisDto.filter,
        }),
      ).toEqual([mockScanResult]);
    });
    it('should scan cluster database', async () => {
      jest.spyOn(Utils, 'getTotalKeys').mockResolvedValue(mockGetTotalResponse);
      expect(
        await service.scan(clusterClient, {
          filter: mockCreateDatabaseAnalysisDto.filter,
        }),
      ).toEqual([mockScanResult, mockScanResult, mockScanResult]);
    });
  });

  describe('nodeScan', () => {
    it('should scan node keys', async () => {
      jest.spyOn(Utils, 'getTotalKeys').mockResolvedValue(mockGetTotalResponse);
      expect(
        await service.nodeScan(standaloneClient, {
          filter: mockCreateDatabaseAnalysisDto.filter,
        }),
      ).toEqual(mockScanResult);
    });
  });
});
