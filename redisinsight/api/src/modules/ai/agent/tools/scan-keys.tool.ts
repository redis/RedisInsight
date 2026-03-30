import { ChatCompletionTool } from 'openai/resources/chat/completions';
import { RedisClient } from 'src/modules/redis/client';

const DEFAULT_COUNT = 20;
const MAX_COUNT = 100;

export const SCAN_KEYS_DEFINITION: ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'scan_keys',
    description:
      'Scan keys in the Redis database matching a pattern. Returns key names with their types. ' +
      'Use this to explore what data exists in the database.',
    parameters: {
      type: 'object',
      properties: {
        match: {
          type: 'string',
          description:
            'Pattern to match keys against (default "*"). Supports glob-style patterns like "user:*", "session:*".',
        },
        count: {
          type: 'number',
          description:
            'Approximate number of keys to return (default 20, max 100).',
        },
        type: {
          type: 'string',
          description:
            'Filter by key type: string, list, set, zset, hash, stream.',
          enum: ['string', 'list', 'set', 'zset', 'hash', 'stream'],
        },
      },
    },
  },
};

export async function executeScanKeys(
  args: { match?: string; count?: number; type?: string },
  client: RedisClient,
): Promise<string> {
  const match = args.match || '*';
  const count = Math.min(args.count ?? DEFAULT_COUNT, MAX_COUNT);

  const scanArgs: (string | number)[] = [
    'SCAN',
    '0',
    'MATCH',
    match,
    'COUNT',
    count,
  ];
  if (args.type) {
    scanArgs.push('TYPE', args.type);
  }

  const keys: string[] = [];
  let cursor = '0';
  let iterations = 0;
  const maxIterations = 10;

  do {
    scanArgs[1] = cursor;
    const cmdArgs = scanArgs.map(String);
    const result = (await client.sendCommand(
      [cmdArgs[0], ...cmdArgs.slice(1)],
      { replyEncoding: 'utf8' },
    )) as [string, string[]];

    cursor = result[0];
    keys.push(...result[1]);
    iterations++;
  } while (cursor !== '0' && keys.length < count && iterations < maxIterations);

  const uniqueKeys = [...new Set(keys)].slice(0, count);

  if (uniqueKeys.length === 0) {
    return `No keys found matching pattern "${match}".`;
  }

  const keyInfos: string[] = [];
  for (const key of uniqueKeys) {
    const keyType = (await client.sendCommand(['TYPE', key], {
      replyEncoding: 'utf8',
    })) as string;
    const ttl = (await client.sendCommand(['TTL', key])) as number;
    const ttlStr = Number(ttl) === -1 ? 'no expiry' : `${ttl}s`;
    keyInfos.push(`${key} (type: ${keyType}, ttl: ${ttlStr})`);
  }

  const totalDbSize = await client.sendCommand(['DBSIZE'], {
    replyEncoding: 'utf8',
  });

  return (
    `Total keys in database: ${totalDbSize}\n` +
    `Showing ${uniqueKeys.length} keys matching "${match}":\n\n` +
    keyInfos.join('\n')
  );
}
