import { ChatCompletionTool } from 'openai/resources/chat/completions';
import { RedisClient } from 'src/modules/redis/client';

export const GET_DATABASE_OVERVIEW_DEFINITION: ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'get_database_overview',
    description:
      'Get an overview of the connected Redis database including version, memory usage, connected clients, ' +
      'operations per second, total keys, and other key metrics. No arguments needed.',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
};

function formatUptime(seconds?: string): string {
  if (!seconds) return 'unknown';
  const s = parseInt(seconds, 10);
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  return `${days}d ${hours}h ${minutes}m`;
}

export async function executeGetDatabaseOverview(
  _args: Record<string, unknown>,
  client: RedisClient,
): Promise<string> {
  const info = (await client.sendCommand(['INFO'], {
    replyEncoding: 'utf8',
  })) as string;

  const dbSizeReply = await client.sendCommand(['DBSIZE'], {
    replyEncoding: 'utf8',
  });

  const sections: Record<string, string> = {};
  for (const line of info.split('\r\n')) {
    if (line.includes(':')) {
      const [key, value] = line.split(':');
      sections[key.trim()] = value?.trim();
    }
  }

  const lines: string[] = [];
  lines.push(`Redis version: ${sections.redis_version ?? 'unknown'}`);
  lines.push(`Uptime: ${formatUptime(sections.uptime_in_seconds)}`);
  lines.push(`Connected clients: ${sections.connected_clients ?? 'unknown'}`);
  lines.push(`Used memory: ${sections.used_memory_human ?? 'unknown'}`);
  lines.push(`Peak memory: ${sections.used_memory_peak_human ?? 'unknown'}`);
  lines.push(`Total keys (current db): ${dbSizeReply}`);
  lines.push(`Ops/sec: ${sections.instantaneous_ops_per_sec ?? 'unknown'}`);
  lines.push(
    `Network input: ${sections.instantaneous_input_kbps ?? 'unknown'} kbps`,
  );
  lines.push(
    `Network output: ${sections.instantaneous_output_kbps ?? 'unknown'} kbps`,
  );
  lines.push(`Role: ${sections.role ?? 'unknown'}`);

  if (sections.cluster_enabled === '1') {
    lines.push('Cluster: enabled');
  }

  const loadedModules = Object.entries(sections)
    .filter(([key]) => key.startsWith('module'))
    .map(([, value]) => value);

  if (loadedModules.length > 0) {
    lines.push(`Loaded modules: ${loadedModules.join(', ')}`);
  }

  return lines.join('\n');
}
