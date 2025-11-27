import { Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { BulkActionsProvider } from 'src/modules/bulk-actions/providers/bulk-actions.provider';
import { CreateBulkActionDto } from 'src/modules/bulk-actions/dto/create-bulk-action.dto';
import { BulkActionIdDto } from 'src/modules/bulk-actions/dto/bulk-action-id.dto';
import { BulkActionsAnalytics } from 'src/modules/bulk-actions/bulk-actions.analytics';
import { SessionMetadata } from 'src/common/models';

@Injectable()
export class BulkActionsService {
  private logger: Logger = new Logger('BulkActionsService');

  constructor(
    private readonly bulkActionsProvider: BulkActionsProvider,
    private readonly analytics: BulkActionsAnalytics,
  ) {}

  async create(
    sessionMetadata: SessionMetadata,
    dto: CreateBulkActionDto,
    socket: Socket,
  ) {
    const bulkAction = await this.bulkActionsProvider.create(
      sessionMetadata,
      dto,
      socket,
    );
    const overview = bulkAction.getOverview();

    this.analytics.sendActionStarted(sessionMetadata, overview);

    return overview;
  }

  async get(dto: BulkActionIdDto) {
    const bulkAction = await this.bulkActionsProvider.get(dto.id);
    return bulkAction.getOverview();
  }

  async abort(dto: BulkActionIdDto) {
    const bulkAction = await this.bulkActionsProvider.abort(dto.id);

    return bulkAction.getOverview();
  }

  async subscribeToReport(socket: Socket, bulkActionId: string) {
    try {
      const bulkAction = await this.bulkActionsProvider.get(bulkActionId);
      bulkAction.subscribeToReport(socket);

      bulkAction.emitReportReady();

      return { status: 'subscribed' };
    } catch (error) {
      this.logger.error(
        `Failed to subscribe to bulk action report ${bulkActionId}:`,
        error,
      );
      throw error;
    }
  }

  async unsubscribeFromReport(socket: Socket, bulkActionId: string) {
    const bulkAction = await this.bulkActionsProvider.get(bulkActionId);
    bulkAction.unsubscribeFromReport(socket);
    return { status: 'unsubscribed' };
  }

  async startExecution(bulkActionId: string) {
    try {
      await this.bulkActionsProvider.startExecution(bulkActionId);

      return { status: 'execution-started' };
    } catch (error) {
      this.logger.error(
        `Failed to start execution for bulk action ${bulkActionId}:`,
        error,
      );
      throw error;
    }
  }

  disconnect(socketId: string) {
    this.bulkActionsProvider.abortUsersBulkActions(socketId);
  }
}
