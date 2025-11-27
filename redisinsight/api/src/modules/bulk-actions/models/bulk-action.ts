import { debounce } from 'lodash';
import {
  BulkActionStatus,
  BulkActionType,
  BulkActionsClientEvents,
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
import { RedisString } from 'src/common/constants';

export class BulkAction implements IBulkAction {
  private logger: Logger = new Logger('BulkAction');

  private startTime: number = Date.now();

  private endTime: number;

  private error: Error;

  private status: BulkActionStatus;

  private runners: IBulkActionRunner[] = [];

  private readonly debounce: Function;

  private reportSubscribers: Set<Socket> = new Set();

  private totalKeysEmitted: number = 0;

  constructor(
    private readonly id: string,
    private readonly databaseId: string,
    private readonly type: BulkActionType,
    private readonly filter: BulkActionFilter,
    private readonly socket: Socket,
    private readonly analytics: BulkActionsAnalytics,
    private readonly enableReporting: boolean = true,
  ) {
    this.debounce = debounce(this.sendOverview.bind(this), 1000, {
      maxWait: 1000,
    });
    this.status = BulkActionStatus.Initialized;
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
      this.setStatus(BulkActionStatus.Running);

      await Promise.all(this.runners.map((runner) => runner.run()));

      this.setStatus(BulkActionStatus.Completed);
    } catch (e) {
      this.logger.error('Error on BulkAction Runner', e);
      this.error = e;
      this.setStatus(BulkActionStatus.Failed);
    }
  }

  /**
   * Get overview for BulkAction with progress details and summary
   */
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

    return {
      id: this.id,
      databaseId: this.databaseId,
      type: this.type,
      duration: (this.endTime || Date.now()) - this.startTime,
      status: this.status,
      filter: this.filter.getOverview(),
      progress,
      summary,
    };
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
        this.emitReportComplete();
      // eslint-disable-next-line no-fallthrough
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

  subscribeToReport(socket: Socket): void {
    this.reportSubscribers.add(socket);
  }

  unsubscribeFromReport(socket: Socket): void {
    this.reportSubscribers.delete(socket);
  }

  emitDeletedKeys(keys: RedisString[]): void {
    this.totalKeysEmitted += keys.length;

    if (
      this.enableReporting &&
      this.reportSubscribers.size > 0 &&
      keys.length > 0
    ) {
      const keyStrings = keys.map((key) => Buffer.from(key).toString());

      this.reportSubscribers.forEach((socket) => {
        try {
          socket.emit(BulkActionsClientEvents.ReportKeys, {
            keys: keyStrings,
            count: keyStrings.length,
            totalEmitted: this.totalKeysEmitted,
          });
        } catch (error) {
          this.logger.error(
            `Failed to emit keys batch to socket ${socket.id}:`,
            error,
          );
          this.reportSubscribers.delete(socket);
        }
      });
    }
  }

  emitReportReady(): void {
    if (this.reportSubscribers.size > 0) {
      this.logger.debug(
        `Emitting report ready to ${this.reportSubscribers.size} subscribers`,
      );
      this.reportSubscribers.forEach((socket) => {
        try {
          socket.emit(BulkActionsClientEvents.ReportReady, {
            bulkActionId: this.id,
            status: this.status,
          });
        } catch (error) {
          this.logger.error(
            `Failed to emit report ready to socket ${socket.id}:`,
            error,
          );
          this.reportSubscribers.delete(socket);
        }
      });
    }
  }

  emitReportComplete(): void {
    if (this.reportSubscribers.size > 0) {
      const overview = this.getOverview();
      this.logger.debug(
        `Emitting report completion to ${this.reportSubscribers.size} subscribers. Status: ${overview.status}`,
      );
      this.reportSubscribers.forEach((socket) => {
        try {
          socket.emit(BulkActionsClientEvents.ReportComplete, {
            status: overview.status,
            summary: overview.summary,
            totalKeysEmitted: this.totalKeysEmitted,
          });
        } catch (error) {
          this.logger.error(
            `Failed to emit completion to socket ${socket.id}:`,
            error,
          );
          this.reportSubscribers.delete(socket);
        }
      });
    } else {
      this.logger.debug(`Bulk action completed but no report subscribers`);
    }
  }
}
