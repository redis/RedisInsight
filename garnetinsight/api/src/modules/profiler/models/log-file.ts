import { join } from 'path';
import * as fs from 'fs-extra';
import { ReadStream, WriteStream } from 'fs';
import config from 'src/utils/config';
import { FileLogsEmitter } from 'src/modules/profiler/emitters/file.logs-emitter';
import { TelemetryEvents } from 'src/constants';

const DIR_PATH = config.get('dir_path');
const PROFILER = config.get('profiler');

export class LogFile {
  private readonly filePath: string;

  private startTime: Date;

  private writeStream: WriteStream;

  private emitter: FileLogsEmitter;

  private readonly clientObservers: Map<string, string> = new Map();

  private idleSince: number = 0;

  private alias: string;

  private analyticsEvents: Map<TelemetryEvents, Function>;

  public readonly instanceId: string;

  public readonly id: string;

  constructor(
    instanceId: string,
    id: string,
    analyticsEvents?: Map<TelemetryEvents, Function>,
  ) {
    this.instanceId = instanceId;
    this.id = id;
    this.alias = id;
    this.filePath = join(DIR_PATH.tmpDir, this.id);
    this.startTime = new Date();
    this.analyticsEvents = analyticsEvents || new Map();
  }

  /**
   * Get or create file write stream to write logs
   */
  getWriteStream(): WriteStream {
    if (!this.writeStream) {
      fs.ensureFileSync(this.filePath);
      this.writeStream = fs.createWriteStream(this.filePath, { flags: 'a' });
    }
    this.writeStream.on('error', () => {});
    return this.writeStream;
  }

  /**
   * Get readable stream of the logs file
   * Used to download file using http server
   */
  getReadStream(): ReadStream {
    fs.ensureFileSync(this.filePath);
    const stream = fs.createReadStream(this.filePath);
    stream.once('end', () => {
      stream.destroy();
      try {
        this.analyticsEvents.get(TelemetryEvents.ProfilerLogDownloaded)(
          this.instanceId,
          this.getFileSize(),
        );
      } catch (e) {
        // ignore analytics errors
      }
      // logFile.destroy();
    });

    return stream;
  }

  /**
   * Get or create logs emitter to use on each 'monitor' event
   */
  getEmitter(): FileLogsEmitter {
    if (!this.emitter) {
      this.emitter = new FileLogsEmitter(this);
    }

    return this.emitter;
  }

  /**
   * Generate file name
   */
  getFilename(): string {
    return `${this.alias}-${this.startTime.getTime()}-${Date.now()}`;
  }

  getFileSize(): number {
    const stats = fs.statSync(this.filePath);
    return stats.size;
  }

  setAlias(alias: string) {
    this.alias = alias;
  }

  addProfilerClient(id: string) {
    this.clientObservers.set(id, id);
    this.idleSince = 0;
  }

  removeProfilerClient(id: string) {
    this.clientObservers.delete(id);

    if (!this.clientObservers.size) {
      this.idleSince = Date.now();

      setTimeout(() => {
        if (
          this?.idleSince &&
          Date.now() - this.idleSince >= PROFILER.logFileIdleThreshold
        ) {
          this.destroy();
        }
      }, PROFILER.logFileIdleThreshold);
    }
  }

  /**
   * Remove file and delete write stream after finish
   */
  destroy() {
    try {
      this.writeStream?.close();
      this.writeStream = null;
      const size = this.getFileSize();
      fs.unlinkSync(this.filePath);

      this.analyticsEvents.get(TelemetryEvents.ProfilerLogDeleted)(
        this.instanceId,
        size,
      );
    } catch (e) {
      // ignore error
    }
  }
}
