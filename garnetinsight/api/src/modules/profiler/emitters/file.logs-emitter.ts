import { ILogsEmitter } from 'src/modules/profiler/interfaces/logs-emitter.interface';
import { LogFile } from 'src/modules/profiler/models/log-file';

export class FileLogsEmitter implements ILogsEmitter {
  public readonly id: string;

  private readonly logFile: LogFile;

  constructor(logFile: LogFile) {
    this.id = logFile.id;
    this.logFile = logFile;
  }

  /**
   * Write batch of logs to a file
   */
  async emit(items: any[]) {
    try {
      if (!this.logFile.getWriteStream()) {
        return;
      }

      const text = items
        .map((item) => {
          const args = item.args
            .map((arg) => `${JSON.stringify(arg)}`)
            .join(' ');
          return `${item.time} [${item.database} ${item.source}] ${args}`;
        })
        .join('\n');

      this.logFile.getWriteStream().write(`${text}\n`);
    } catch (e) {
      // ignore error
    }
  }

  async addProfilerClient(id: string) {
    return this.logFile.addProfilerClient(id);
  }

  async removeProfilerClient(id: string) {
    return this.logFile.removeProfilerClient(id);
  }

  async flushLogs() {
    return this.logFile.destroy();
  }
}
