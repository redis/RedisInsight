export enum ProfilerClientEvents {
  Monitor = 'monitor',
  Pause = 'pause',
  FlushLogs = 'flushLogs',
}

export enum ProfilerServerEvents {
  Data = 'monitorData',
  Exception = 'exception',
}

export enum RedisObserverStatus {
  Empty = 'empty',
  Initializing = 'initializing',
  Connected = 'connected',
  Wait = 'wait',
  Ready = 'ready',
  End = 'end',
  Error = 'error',
}
