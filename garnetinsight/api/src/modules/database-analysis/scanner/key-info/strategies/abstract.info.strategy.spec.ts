import { when } from 'jest-when';
import { HashInfoStrategy } from 'src/modules/database-analysis/scanner/key-info/strategies/hash-info.strategy';
import { mockStandaloneRedisClient } from 'src/__mocks__';

const mockKey = Buffer.from('key');
const mockRedisResponse = 1;

describe('AbstractInfoStrategy', () => {
  const client = mockStandaloneRedisClient;
  const strategy = new HashInfoStrategy();

  beforeEach(async () => {
    when(client.sendCommand)
      .calledWith(expect.arrayContaining(['hlen']))
      .mockResolvedValue(mockRedisResponse);
  });

  describe('getLengthSafe', () => {
    it('should get length', async () => {
      expect(await strategy.getLengthSafe(client, mockKey)).toEqual(
        mockRedisResponse,
      );
    });
    it('should return null in case of error', async () => {
      when(client.sendCommand)
        .calledWith(expect.arrayContaining(['hlen']))
        .mockRejectedValueOnce(new Error('some error'));

      expect(await strategy.getLengthSafe(client, mockKey)).toEqual(null);
    });
  });
});
