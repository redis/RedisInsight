import { when } from 'jest-when';
import { StringInfoStrategy } from 'src/modules/database-analysis/scanner/key-info/strategies/string-info.strategy';
import { mockStandaloneRedisClient } from 'src/__mocks__';

const mockKey = Buffer.from('key');
const mockRedisResponse = 1;

describe('StringInfoStrategy', () => {
  const client = mockStandaloneRedisClient;
  const strategy = new StringInfoStrategy();

  beforeEach(async () => {
    when(client.sendCommand)
      .calledWith(expect.arrayContaining(['strlen']))
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
