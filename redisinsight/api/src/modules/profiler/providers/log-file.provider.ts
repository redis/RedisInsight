import { ReadStream } from 'fs';
import { Injectable, NotFoundException, OnModuleDestroy } from '@nestjs/common';
import { LogFile } from 'src/modules/profiler/models/log-file';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { ProfilerAnalyticsService } from 'src/modules/profiler/profiler-analytics.service';
import { SessionMetadata } from 'src/common/models';
import { Database } from 'src/modules/database/models/database';

@Injectable()
export class LogFileProvider implements OnModuleDestroy {
  private profilerLogFiles: Map<string, LogFile> = new Map();

  constructor(private analyticsService: ProfilerAnalyticsService) {}

  /**
   * Get or create Profiler Log File to work with
   * @param instanceId
   * @param id
   * @param sessionMetadata
   * @param database
   */
  getOrCreate(
    instanceId: string,
    id: string,
    sessionMetadata?: SessionMetadata,
    database?: Database,
  ): LogFile {
    if (!this.profilerLogFiles.has(id)) {
      this.profilerLogFiles.set(
        id,
        new LogFile(
          instanceId,
          id,
          this.analyticsService.getEventsEmitters(),
          sessionMetadata,
          database,
        ),
      );
    }

    return this.profilerLogFiles.get(id);
  }

  /**
   * Get Profiler Log File or throw an error
   * @param id
   */
  get(id: string): LogFile {
    if (!this.profilerLogFiles.has(id)) {
      throw new NotFoundException(ERROR_MESSAGES.PROFILER_LOG_FILE_NOT_FOUND);
    }

    return this.profilerLogFiles.get(id);
  }

  /**
   * Get ReadableStream for download and filename
   * Delete file after download finished
   * @param id
   */
  async getDownloadData(id): Promise<{ stream: ReadStream; filename: string }> {
    const logFile = await this.get(id);
    const stream = await logFile.getReadStream();

    return { stream, filename: logFile.getFilename() };
  }

  onModuleDestroy() {
    this.profilerLogFiles.forEach((logFile) => {
      try {
        logFile.destroy();
      } catch (e) {
        // process other files on error
      }
    });
  }
}
