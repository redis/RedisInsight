import { ChatCompletionTool } from 'openai/resources/chat/completions';
import { RedisClient } from 'src/modules/redis/client';

const DEFAULT_COUNT = 25;

export const GET_SLOW_LOGS_DEFINITION: ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'get_slow_logs',
    description:
      'Retrieve the Redis slow log entries. Returns recent commands that exceeded the configured slowlog threshold. ' +
      'Useful for performance analysis and identifying bottlenecks.',
    parameters: {
      type: 'object',
      properties: {
        count: {
          type: 'number',
          description: 'Number of slow log entries to retrieve (default 25)',
        },
      },
    },
  },
};

export async function executeGetSlowLogs(
  args: { count?: number },
  client: RedisClient,
): Promise<string> {
  const count = args.count ?? DEFAULT_COUNT;
  const nodes = await client.nodes();

  const allLogs: string[] = [];

  for (const node of nodes) {
    const resp = (await node.call(['SLOWLOG', 'GET', count], {
      replyEncoding: 'utf8',
    })) as Array<Array<string | number | string[]>>;

    for (const log of resp) {
      const [id, time, durationUs, cmdArgs] = log;
      const timestamp = new Date(Number(time) * 1000).toISOString();
      const durationMs = (Number(durationUs) / 1000).toFixed(2);
      const command = Array.isArray(cmdArgs)
        ? cmdArgs.join(' ')
        : String(cmdArgs);
      allLogs.push(
        `ID: ${id} | Time: ${timestamp} | Duration: ${durationMs}ms | Command: ${command}`,
      );
    }
  }

  if (allLogs.length === 0) {
    return 'No slow log entries found. The slow log is empty.';
  }

  const configResp = (await client.sendCommand(
    ['CONFIG', 'GET', 'slowlog-log-slower-than'],
    { replyEncoding: 'utf8' },
  )) as string[];

  const threshold = configResp?.[1]
    ? `${(Number(configResp[1]) / 1000).toFixed(2)}ms`
    : 'unknown';

  return (
    `Slow log threshold: ${threshold}\n` +
    `Total entries: ${allLogs.length}\n\n` +
    allLogs.join('\n')
  );
}
