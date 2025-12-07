import { when } from 'jest-when';
import { ZSetInfoStrategy } from 'src/modules/database-analysis/scanner/key-info/strategies/z-set-info.strategy';
import { mockStandaloneRedisClient } from 'src/__mocks__';

const mockKey = Buffer.from('key');
const mockRedisResponse = 1;

describe('ZSetInfoStrategy', () => {
  const client = mockStandaloneRedisClient;
  const strategy = new ZSetInfoStrategy();

  beforeEach(async () => {
    when(client.sendCommand)
      .calledWith(expect.arrayContaining(['zcard']))
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
