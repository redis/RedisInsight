import { when } from 'jest-when';
import { TsInfoStrategy } from 'src/modules/database-analysis/scanner/key-info/strategies/ts-info.strategy';
import { mockStandaloneRedisClient } from 'src/__mocks__';

const mockKey = Buffer.from('key');
const mockRedisResponse = [
  'totalSamples',
  10,
  'memoryUsage',
  4239,
  'firstTimestamp',
  0,
  'lastTimestamp',
  0,
  'retentionTime',
  6000,
  'chunkCount',
  1,
  'chunkSize',
  4096,
];

describe('TsInfoStrategy', () => {
  const client = mockStandaloneRedisClient;
  const strategy = new TsInfoStrategy();

  beforeEach(async () => {
    when(client.sendCommand)
      .calledWith(expect.arrayContaining(['ts.info']), expect.anything())
      .mockResolvedValue(mockRedisResponse);
  });

  describe('getLength', () => {
    it('should get length', async () => {
      expect(await strategy.getLength(client, mockKey)).toEqual(10);
    });
  });
});
