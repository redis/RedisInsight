export interface ILogsEmitter {
  id: string;
  emit: (items: any[]) => void;
  addProfilerClient: (id: string) => void;
  removeProfilerClient: (id: string) => void;
  flushLogs: () => void;
}
