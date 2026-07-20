import { mockCommonClientMetadata } from 'src/__mocks__/common';
import { MockRedisClient } from 'src/__mocks__/redis-client';
import { BrowserToolArrayCommands } from 'src/modules/browser/constants/browser-tool-commands';
import { RedisClient, RedisFeature } from './redis.client';

// Bypass MockRedisClient's per-instance jest.fn() override and invoke the
// real RedisClient.isFeatureSupported implementation.
const callRealIsFeatureSupported = (
  client: MockRedisClient,
  feature: RedisFeature,
): Promise<boolean> =>
  RedisClient.prototype.isFeatureSupported.call(client, feature);

describe('RedisClient', () => {
  let client: MockRedisClient;

  beforeEach(() => {
    client = new MockRedisClient(mockCommonClientMetadata);
  });

  describe('isFeatureSupported(ArrayCommands)', () => {
    it('returns true when COMMAND INFO reports the probe command', async () => {
      client.call = jest
        .fn()
        .mockResolvedValue([
          ['arget', 2, ['readonly', 'fast'], 1, 1, 1, [], [], [], []],
        ]);

      const result = await callRealIsFeatureSupported(
        client,
        RedisFeature.ArrayCommands,
      );

      expect(result).toBe(true);
      expect(client.call).toHaveBeenCalledWith(
        ['command', 'info', BrowserToolArrayCommands.ArGet],
        { replyEncoding: 'utf8' },
      );
    });

    it('returns false when COMMAND INFO returns a nil entry (unknown command)', async () => {
      client.call = jest.fn().mockResolvedValue([null]);

      const result = await callRealIsFeatureSupported(
        client,
        RedisFeature.ArrayCommands,
      );

      expect(result).toBe(false);
    });

    it('returns false when COMMAND INFO returns an empty array', async () => {
      client.call = jest.fn().mockResolvedValue([]);

      const result = await callRealIsFeatureSupported(
        client,
        RedisFeature.ArrayCommands,
      );

      expect(result).toBe(false);
    });

    it('returns false when COMMAND INFO returns a non-array reply', async () => {
      client.call = jest.fn().mockResolvedValue(null);

      const result = await callRealIsFeatureSupported(
        client,
        RedisFeature.ArrayCommands,
      );

      expect(result).toBe(false);
    });

    it('falls back to a version check when COMMAND INFO throws on a 8.8+ server', async () => {
      // Reproduces the ACL-restricted user case: COMMAND INFO is forbidden
      // (@slow / @connection) but @array data commands are permitted.
      client.call = jest.fn().mockRejectedValue(new Error('NOPERM'));
      client.getInfo = jest
        .fn()
        .mockResolvedValue({ server: { redis_version: '8.8.0' } });

      const result = await callRealIsFeatureSupported(
        client,
        RedisFeature.ArrayCommands,
      );

      expect(result).toBe(true);
    });

    it('returns false when COMMAND INFO throws on a pre-8.8 server', async () => {
      client.call = jest.fn().mockRejectedValue(new Error('NOPERM'));
      client.getInfo = jest
        .fn()
        .mockResolvedValue({ server: { redis_version: '8.4.0' } });

      const result = await callRealIsFeatureSupported(
        client,
        RedisFeature.ArrayCommands,
      );

      expect(result).toBe(false);
    });

    it('returns false when COMMAND INFO throws and the server version is unknown', async () => {
      client.call = jest.fn().mockRejectedValue(new Error('NOPERM'));
      // Default MockRedisClient.getInfo resolves to undefined, leaving the
      // probe with no fallback signal.

      const result = await callRealIsFeatureSupported(
        client,
        RedisFeature.ArrayCommands,
      );

      expect(result).toBe(false);
    });

    it('caches the probe result across repeated invocations', async () => {
      client.call = jest
        .fn()
        .mockResolvedValue([
          ['arget', 2, ['readonly', 'fast'], 1, 1, 1, [], [], [], []],
        ]);

      const first = await callRealIsFeatureSupported(
        client,
        RedisFeature.ArrayCommands,
      );
      const second = await callRealIsFeatureSupported(
        client,
        RedisFeature.ArrayCommands,
      );

      expect(first).toBe(true);
      expect(second).toBe(true);
      expect(client.call).toHaveBeenCalledTimes(1);
    });

    it('caches a negative probe result across repeated invocations', async () => {
      client.call = jest.fn().mockResolvedValue([null]);

      const first = await callRealIsFeatureSupported(
        client,
        RedisFeature.ArrayCommands,
      );
      const second = await callRealIsFeatureSupported(
        client,
        RedisFeature.ArrayCommands,
      );

      expect(first).toBe(false);
      expect(second).toBe(false);
      expect(client.call).toHaveBeenCalledTimes(1);
    });
  });
});
