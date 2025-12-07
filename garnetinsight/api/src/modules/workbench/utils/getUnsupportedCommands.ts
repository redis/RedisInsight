import config from 'src/utils/config';

const WORKBENCH_CONFIG = config.get('workbench');

export enum WorkbenchToolUnsupportedCommands {
  Monitor = 'monitor',
  Subscribe = 'subscribe',
  PSubscribe = 'psubscribe',
  SSubscribe = 'ssubscribe',
  Sync = 'sync',
  PSync = 'psync',
  ScriptDebug = 'script debug',
  Select = 'select',
  Hello3 = 'hello 3',
}

export const getUnsupportedCommands = (): string[] => [
  ...Object.values(WorkbenchToolUnsupportedCommands),
  ...WORKBENCH_CONFIG.unsupportedCommands,
];
