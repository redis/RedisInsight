import { Module } from '@nestjs/common';
import { BulkActionsService } from 'src/modules/bulk-actions/bulk-actions.service';
import { BulkActionsProvider } from 'src/modules/bulk-actions/providers/bulk-actions.provider';
import { BulkActionsGateway } from 'src/modules/bulk-actions/bulk-actions.gateway';
import { BulkActionsAnalytics } from 'src/modules/bulk-actions/bulk-actions.analytics';
import { BulkActionsController } from 'src/modules/bulk-actions/bulk-actions.controller';
import { BulkImportController } from 'src/modules/bulk-actions/bulk-import.controller';
import { BulkImportService } from 'src/modules/bulk-actions/bulk-import.service';

@Module({
  controllers: [BulkActionsController, BulkImportController],
  providers: [
    BulkActionsGateway,
    BulkActionsService,
    BulkActionsProvider,
    BulkActionsAnalytics,
    BulkImportService,
  ],
  exports: [BulkImportService, BulkActionsAnalytics],
})
export class BulkActionsModule {}
