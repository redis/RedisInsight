import { Socket } from 'socket.io';
import { Response } from 'express';
import { BadRequestException, Injectable } from '@nestjs/common';
import { BulkActionsProvider } from 'src/modules/bulk-actions/providers/bulk-actions.provider';
import { CreateBulkActionDto } from 'src/modules/bulk-actions/dto/create-bulk-action.dto';
import { BulkActionIdDto } from 'src/modules/bulk-actions/dto/bulk-action-id.dto';
import { BulkActionsAnalytics } from 'src/modules/bulk-actions/bulk-actions.analytics';
import { SessionMetadata } from 'src/common/models';

@Injectable()
export class BulkActionsService {
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

  disconnect(socketId: string) {
    this.bulkActionsProvider.abortUsersBulkActions(socketId);
  }

  /**
   * Stream bulk action report as downloadable file
   * @param id Bulk action id
   * @param res Express response object
   */
  async streamReport(id: string, res: Response): Promise<void> {
    const bulkAction = this.bulkActionsProvider.get(id);

    if (!bulkAction.isReportEnabled()) {
      throw new BadRequestException(
        'Report generation was not enabled for this bulk action',
      );
    }

    // Set headers for file download
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="bulk-delete-report.txt"',
    );
    res.setHeader('Transfer-Encoding', 'chunked');

    // Attach the response stream to the bulk action
    // This will trigger the bulk action to start processing
    bulkAction.setStreamingResponse(res);
  }
}
