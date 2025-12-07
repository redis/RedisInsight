import { when } from 'jest-when';
import { SetInfoStrategy } from 'src/modules/database-analysis/scanner/key-info/strategies/set-info.strategy';
import { mockStandaloneRedisClient } from 'src/__mocks__';

const mockKey = Buffer.from('key');
const mockRedisResponse = 1;

describe('SetInfoStrategy', () => {
  const client = mockStandaloneRedisClient;
  const strategy = new SetInfoStrategy();

  beforeEach(async () => {
    when(client.sendCommand)
      .calledWith(expect.arrayContaining(['scard']))
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
