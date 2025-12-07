import { when } from 'jest-when';
import { HashInfoStrategy } from 'src/modules/database-analysis/scanner/key-info/strategies/hash-info.strategy';
import { mockStandaloneRedisClient } from 'src/__mocks__';

const mockKey = Buffer.from('key');
const mockRedisResponse = 1;

describe('HashInfoStrategy', () => {
  const client = mockStandaloneRedisClient;
  const strategy = new HashInfoStrategy();

  beforeEach(async () => {
    when(client.sendCommand)
      .calledWith(expect.arrayContaining(['hlen']))
      .mockResolvedValue(mockRedisResponse);
  });

  describe('getLength', () => {
    it('should scan standalone database', async () => {
      expect(await strategy.getLength(client, mockKey)).toEqual(
        mockRedisResponse,
      );
    });
  });
});
