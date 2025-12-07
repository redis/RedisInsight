export class RedisError extends Error {
  name: string;

  command: any;
}
export class ReplyError extends RedisError {
  previousErrors?: RedisError[];

  code?: string;
}

export enum AppTool {
  Common = 'Common',
  Browser = 'Browser',
  CLI = 'CLI',
  Workbench = 'Workbench',
}

export class IRedisModule {
  name: string;

  ver: number;
}
