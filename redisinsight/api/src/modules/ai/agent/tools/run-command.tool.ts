import { ChatCompletionTool } from 'openai/resources/chat/completions';
import { RedisClient } from 'src/modules/redis/client';
import { splitCliCommandLine } from 'src/utils/cli-helper';

export const RUN_COMMAND_DEFINITION: ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'run_redis_command',
    description:
      'Execute a Redis command on the connected database and return the result. ' +
      'Use this to read/write data, check configuration, or perform any Redis operation.',
    parameters: {
      type: 'object',
      properties: {
        command: {
          type: 'string',
          description:
            'The full Redis command to execute, e.g. "SET mykey hello", "HGETALL user:1", "INFO server"',
        },
      },
      required: ['command'],
    },
  },
};

function formatReply(reply: unknown, depth = 0): string {
  if (reply === null || reply === undefined) {
    return '(nil)';
  }

  if (typeof reply === 'string' || typeof reply === 'number') {
    return String(reply);
  }

  if (Array.isArray(reply)) {
    if (reply.length === 0) {
      return '(empty array)';
    }
    return reply
      .map((item, i) => `${i + 1}) ${formatReply(item, depth + 1)}`)
      .join('\n');
  }

  return String(reply);
}

export async function executeRunCommand(
  args: { command: string },
  client: RedisClient,
): Promise<string> {
  const [command, ...commandArgs] = splitCliCommandLine(args.command);

  if (!command) {
    return 'Error: Empty command provided';
  }

  const reply = await client.sendCommand([command, ...commandArgs], {
    replyEncoding: 'utf8',
  });

  return formatReply(reply);
}
