import { debounce } from 'lodash';
import { Response } from 'express';
import {
  BulkActionStatus,
  BulkActionType,
} from 'src/modules/bulk-actions/constants';
import { BulkActionFilter } from 'src/modules/bulk-actions/models/bulk-action-filter';
import { Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import {
  IBulkAction,
  IBulkActionRunner,
} from 'src/modules/bulk-actions/interfaces';
import { IBulkActionOverview } from 'src/modules/bulk-actions/interfaces/bulk-action-overview.interface';
import { BulkActionsAnalytics } from 'src/modules/bulk-actions/bulk-actions.analytics';
import { RedisClient, RedisClientNodeRole } from 'src/modules/redis/client';
import { SessionMetadata } from 'src/common/models';

export class BulkAction implements IBulkAction {
  private logger: Logger = new Logger('BulkAction');

  private startTime: number = Date.now();

  private endTime: number;

  private error: Error;

  private status: BulkActionStatus;

  private runners: IBulkActionRunner[] = [];

  private readonly debounce: Function;

  private readonly generateReport: boolean;

  private streamingResponse: Response | null = null;

  private streamReadyResolver: (() => void) | null = null;

  constructor(
    private readonly id: string,
    private readonly databaseId: string,
    private readonly type: BulkActionType,
    private readonly filter: BulkActionFilter,
    private readonly socket: Socket,
    private readonly analytics: BulkActionsAnalytics,
    generateReport: boolean = false,
  ) {
    this.debounce = debounce(this.sendOverview.bind(this), 1000, {
      maxWait: 1000,
    });
    this.status = BulkActionStatus.Initialized;
    this.generateReport = generateReport;
  }

  /**
   * Setup runners and fetch total keys once before run
   * @param redisClient
   * @param RunnerClassName
   */
  async prepare(redisClient: RedisClient, RunnerClassName) {
    if (this.status !== BulkActionStatus.Initialized) {
      throw new Error(
        `Unable to prepare bulk action with "${this.status}" status`,
      );
    }

    this.status = BulkActionStatus.Preparing;

    this.runners = (await redisClient.nodes(RedisClientNodeRole.PRIMARY)).map(
      (node) => new RunnerClassName(this, node),
    );

    await Promise.all(this.runners.map((runner) => runner.prepareToStart()));

    this.status = BulkActionStatus.Ready;
  }

  /**
   * Start bulk operation in case if it was prepared before only
   */
  async start() {
    if (this.status !== BulkActionStatus.Ready) {
      throw new Error(
        `Unable to start bulk action with "${this.status}" status`,
      );
    }

    this.run().catch();

    return this.getOverview();
  }

  /**
   * Run bulk action on each runner
   * @private
   */
  private async run() {
    try {
      // Wait for streaming response to be attached if report generation is enabled
      await this.waitForStreamIfNeeded();

      this.setStatus(BulkActionStatus.Running);

      await Promise.all(this.runners.map((runner) => runner.run()));

      this.setStatus(BulkActionStatus.Completed);
    } catch (e) {
      this.logger.error('Error on BulkAction Runner', e);
      this.error = e;
      this.setStatus(BulkActionStatus.Failed);
    } finally {
      this.finalizeReport();
    }
  }

  private static readonly STREAM_TIMEOUT_MS = 5_000;

  private async waitForStreamIfNeeded(): Promise<void> {
    if (!this.generateReport) {
      return;
    }

    if (this.streamingResponse) {
      return;
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.streamReadyResolver = null;
        reject(new Error('Unable to start report download. Please try again.'));
      }, BulkAction.STREAM_TIMEOUT_MS);

      this.streamReadyResolver = () => {
        clearTimeout(timeout);
        resolve();
      };
    });
  }

  isReportEnabled(): boolean {
    return this.generateReport;
  }

  setStreamingResponse(res: Response): void {
    // If stream arrives too late (after timeout/failure), immediately end it
    if (!this.streamReadyResolver) {
      res.write('Unable to generate report. Please try again.\n');
      res.end();
      return;
    }

    this.streamingResponse = res;

    this.writeReportHeader();

    this.streamReadyResolver();
    this.streamReadyResolver = null;
  }

  private writeReportHeader(): void {
    if (!this.streamingResponse) return;

    const header = [
      'Bulk Delete Report',
      `Command Executed for each key: ${this.type.toUpperCase()} key_name`,
      'A summary is provided at the end of this file.',
      '==================',
      '',
    ].join('\n');

    this.streamingResponse.write(header);
  }

  writeToReport(keyName: Buffer, success: boolean, error?: string): void {
    if (!this.streamingResponse) return;

    const keyNameStr = keyName.toString();
    const line = success
      ? `${keyNameStr} - OK\n`
      : `${keyNameStr} - Error: ${error || 'Unknown error'}\n`;

    this.streamingResponse.write(line);
  }

  private finalizeReport(): void {
    if (!this.streamingResponse) return;

    const overview = this.getOverview();

    const footer = [
      '',
      '=============',
      'Summary:',
      '=============',
      `Status: ${overview.status}`,
      `Processed: ${overview.summary.processed} keys`,
      `Succeeded: ${overview.summary.succeed} keys`,
      `Failed: ${overview.summary.failed} keys`,
      '',
    ].join('\n');

    this.streamingResponse.write(footer);
    this.streamingResponse.end();
  }

  getOverview(): IBulkActionOverview {
    const progress = this.runners
      .map((runner) => runner.getProgress().getOverview())
      .reduce(
        (cur, prev) => ({
          total: prev.total + cur.total,
          scanned: prev.scanned + cur.scanned,
        }),
        {
          total: 0,
          scanned: 0,
        },
      );

    const summary = this.runners
      .map((runner) => runner.getSummary().getOverview())
      .reduce(
        (cur, prev) => ({
          processed: prev.processed + cur.processed,
          succeed: prev.succeed + cur.succeed,
          failed: prev.failed + cur.failed,
          errors: prev.errors.concat(cur.errors),
          keys: [...prev.keys, ...cur.keys],
        }),
        {
          processed: 0,
          succeed: 0,
          failed: 0,
          errors: [],
          keys: [],
        },
      );

    summary.errors = summary.errors.slice(0, 500).map((error) => ({
      key: error.key.toString(),
      error: error.error.toString(),
    }));

    const overview: IBulkActionOverview = {
      id: this.id,
      databaseId: this.databaseId,
      type: this.type,
      duration: (this.endTime || Date.now()) - this.startTime,
      status: this.status,
      filter: this.filter.getOverview(),
      progress,
      summary,
    };

    if (this.generateReport) {
      overview.downloadUrl = this.getDownloadUrl();
    }

    if (this.error) {
      overview.error = this.error.message;
    }

    return overview;
  }

  private getDownloadUrl(): string {
    return `databases/${this.databaseId}/bulk-actions/${this.id}/report/download`;
  }

  getId() {
    return this.id;
  }

  getStatus(): BulkActionStatus {
    return this.status;
  }

  setStatus(status) {
    switch (this.status) {
      case BulkActionStatus.Completed:
      case BulkActionStatus.Failed:
      case BulkActionStatus.Aborted:
        return;
      default:
        this.status = status;
    }

    switch (status) {
      case BulkActionStatus.Aborted:
      case BulkActionStatus.Failed:
      case BulkActionStatus.Completed:
        if (!this.endTime) {
          this.endTime = Date.now();
        }
        // Queue the state change, then flush immediately for terminal states
        this.changeState();
        (this.debounce as ReturnType<typeof debounce>).flush();
        break;
      default:
        this.changeState();
    }
  }

  getFilter(): BulkActionFilter {
    return this.filter;
  }

  getSocket(): Socket {
    return this.socket;
  }

  changeState() {
    this.debounce();
  }

  /**
   * Send overview to a client
   * @param sessionMetadata
   */
  sendOverview(sessionMetadata: SessionMetadata) {
    const overview = this.getOverview();
    if (overview.status === BulkActionStatus.Completed) {
      this.analytics.sendActionSucceed(sessionMetadata, overview);
    }
    if (overview.status === BulkActionStatus.Failed) {
      this.analytics.sendActionFailed(sessionMetadata, overview, this.error);
    }
    if (overview.status === BulkActionStatus.Aborted) {
      this.analytics.sendActionStopped(sessionMetadata, overview);
    }
    try {
      this.socket.emit('overview', overview);
    } catch (e) {
      this.logger.error('Unable to send overview', e, sessionMetadata);
    }
  }
}
