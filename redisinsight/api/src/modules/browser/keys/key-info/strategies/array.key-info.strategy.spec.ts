import { BrowserToolArrayCommands } from 'src/modules/browser/constants/browser-tool-commands';
import { RedisDataType } from 'src/modules/browser/keys/dto';
import { mockStandaloneRedisClient } from 'src/__mocks__';
import { BrowserToolKeysCommands } from 'src/modules/browser/constants/browser-tool-commands';
import { ArrayKeyInfoStrategy } from './array.key-info.strategy';

describe('ArrayKeyInfoStrategy', () => {
  const strategy = new ArrayKeyInfoStrategy();
  const client = mockStandaloneRedisClient;
  const key = Buffer.from('array-key');

  beforeEach(() => {
    client.sendPipeline = jest.fn();
  });

  it('returns array populated count and logical metadata', async () => {
    client.sendPipeline.mockResolvedValue([
      [null, -1],
      [null, 2],
      [null, 128],
      [null, ['count', 2, 'len', '1000001', 'next-insert-index', '1000001']],
    ]);

    await expect(
      strategy.getInfo(client, key, RedisDataType.Array, true),
    ).resolves.toEqual({
      name: key,
      type: RedisDataType.Array,
      ttl: -1,
      size: 128,
      length: 2,
      arrayLogicalLength: '1000001',
      arrayNextIndex: '1000001',
    });

    expect(client.sendPipeline).toHaveBeenCalledWith([
      [BrowserToolKeysCommands.Ttl, key],
      [BrowserToolArrayCommands.ARCount, key],
      [BrowserToolKeysCommands.MemoryUsage, key, 'samples', '0'],
      [BrowserToolArrayCommands.ARInfo, key],
    ]);
  });
});
