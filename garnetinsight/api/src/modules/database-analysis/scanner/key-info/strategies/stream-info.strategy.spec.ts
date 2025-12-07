import { when } from 'jest-when';
import { StreamInfoStrategy } from 'src/modules/database-analysis/scanner/key-info/strategies/stream-info.strategy';
import { mockStandaloneRedisClient } from 'src/__mocks__';

const mockKey = Buffer.from('key');
const mockRedisResponse = 1;

describe('StreamInfoStrategy', () => {
  const client = mockStandaloneRedisClient;
  const strategy = new StreamInfoStrategy();

  beforeEach(async () => {
    when(client.sendCommand)
      .calledWith(expect.arrayContaining(['xlen']))
      .mockResolvedValue(mockRedisResponse);
  });

  describe('getLength', () => {
    it('should get length', async () => {
      expect(await strategy.getLength(client, mockKey)).toEqual(
        mockRedisResponse,
      );
    });
  });
});
