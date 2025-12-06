import { faker } from '@faker-js/faker';

export const TEST_KEY_PREFIX = 'test-';

/**
 * Common Redis commands for testing
 */
export const COMMANDS = {
  // Basic commands
  PING: 'PING',
  INFO: 'INFO',
  DBSIZE: 'DBSIZE',
  TIME: 'TIME',
  CLIENT_LIST: 'CLIENT LIST',

  // String commands
  SET: (key: string, value: string) => `SET ${key} "${value}"`,
  GET: (key: string) => `GET ${key}`,
  DEL: (key: string) => `DEL ${key}`,
  MSET: (pairs: Record<string, string>) =>
    `MSET ${Object.entries(pairs)
      .map(([k, v]) => `${k} "${v}"`)
      .join(' ')}`,
  MGET: (keys: string[]) => `MGET ${keys.join(' ')}`,

  // Hash commands
  HSET: (key: string, field: string, value: string) => `HSET ${key} ${field} "${value}"`,
  HGET: (key: string, field: string) => `HGET ${key} ${field}`,
  HGETALL: (key: string) => `HGETALL ${key}`,

  // List commands
  LPUSH: (key: string, value: string) => `LPUSH ${key} "${value}"`,
  RPUSH: (key: string, value: string) => `RPUSH ${key} "${value}"`,
  LRANGE: (key: string, start = 0, stop = -1) => `LRANGE ${key} ${start} ${stop}`,

  // Set commands
  SADD: (key: string, member: string) => `SADD ${key} "${member}"`,
  SMEMBERS: (key: string) => `SMEMBERS ${key}`,

  // Sorted Set commands
  ZADD: (key: string, score: number, member: string) => `ZADD ${key} ${score} "${member}"`,
  ZRANGE: (key: string, start = 0, stop = -1) => `ZRANGE ${key} ${start} ${stop}`,

  // JSON commands (requires RedisJSON module)
  JSON_SET: (key: string, path: string, value: string) => `JSON.SET ${key} ${path} '${value}'`,
  JSON_GET: (key: string, path = '$') => `JSON.GET ${key} ${path}`,
};

/**
 * Expected results for common commands
 */
export const EXPECTED_RESULTS = {
  PING: '"PONG"',
  OK: '"OK"',
};

/**
 * Generate a test key name with prefix
 */
export function generateTestKey(type = 'key'): string {
  return `${TEST_KEY_PREFIX}${type}-${faker.string.alphanumeric(8)}`;
}

/**
 * Generate test data for workbench commands
 */
export function getWorkbenchTestData() {
  const keyName = generateTestKey('wb');
  const value = faker.lorem.word();

  return {
    keyName,
    value,
    setCommand: COMMANDS.SET(keyName, value),
    getCommand: COMMANDS.GET(keyName),
    delCommand: COMMANDS.DEL(keyName),
  };
}

/**
 * Generate multiple commands for batch testing
 */
export function getMultipleCommands(count = 3): string[] {
  return Array.from({ length: count }, () => {
    const data = getWorkbenchTestData();
    return data.setCommand;
  });
}

/**
 * Generate an invalid command for error testing
 */
export function getInvalidCommand(): string {
  return `INVALID_COMMAND_${faker.string.alphanumeric(8)}`;
}

/**
 * Generate a command with syntax error
 */
export function getSyntaxErrorCommand(): string {
  return 'SET key'; // Missing value
}

