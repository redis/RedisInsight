import { when } from 'jest-when';
import { GraphInfoStrategy } from 'src/modules/database-analysis/scanner/key-info/strategies/graph-info.strategy';
import { mockStandaloneRedisClient } from 'src/__mocks__';

const mockKey = Buffer.from('key');
const mockRedisResponse = [
  [[1, 'count(r)']],
  [[[3, 999]]],
  [
    'Cached execution: 1',
    'Query internal execution time: 0.093200 milliseconds',
  ],
];

describe('GraphInfoStrategy', () => {
  const client = mockStandaloneRedisClient;
  const strategy = new GraphInfoStrategy();

  beforeEach(async () => {
    when(client.sendCommand)
      .calledWith(expect.arrayContaining(['graph.query']), expect.anything())
      .mockResolvedValue(mockRedisResponse);
  });

  describe('getLength', () => {
    it('should get length', async () => {
      expect(await strategy.getLength(client, mockKey)).toEqual(999);
    });
  });
});
