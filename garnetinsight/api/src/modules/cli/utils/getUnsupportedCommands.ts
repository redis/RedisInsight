import config from 'src/utils/config';

const REDIS_CLI_CONFIG = config.get('redis_cli');

export enum CliToolUnsupportedCommands {
  Monitor = 'monitor',
  Subscribe = 'subscribe',
  PSubscribe = 'psubscribe',
  SSubscribe = 'ssubscribe',
  Sync = 'sync',
  PSync = 'psync',
  ScriptDebug = 'script debug',
  Hello3 = 'hello 3',
}

export const getUnsupportedCommands = (): string[] => [
  ...Object.values(CliToolUnsupportedCommands),
  ...REDIS_CLI_CONFIG.unsupportedCommands,
];
