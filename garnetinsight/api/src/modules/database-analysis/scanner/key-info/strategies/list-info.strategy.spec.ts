import { when } from 'jest-when';
import { ListInfoStrategy } from 'src/modules/database-analysis/scanner/key-info/strategies/list-info.strategy';
import { mockStandaloneRedisClient } from 'src/__mocks__';

const mockKey = Buffer.from('key');
const mockRedisResponse = 1;

describe('ListInfoStrategy', () => {
  const client = mockStandaloneRedisClient;
  const strategy = new ListInfoStrategy();

  beforeEach(async () => {
    when(client.sendCommand)
      .calledWith(expect.arrayContaining(['llen']))
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
