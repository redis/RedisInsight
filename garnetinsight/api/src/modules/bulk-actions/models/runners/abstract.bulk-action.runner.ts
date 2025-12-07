import { BulkActionProgress } from 'src/modules/bulk-actions/models/bulk-action-progress';
import { BulkActionSummary } from 'src/modules/bulk-actions/models/bulk-action-summary';
import {
  IBulkAction,
  IBulkActionRunner,
} from 'src/modules/bulk-actions/interfaces';

export abstract class AbstractBulkActionRunner implements IBulkActionRunner {
  protected bulkAction: IBulkAction;

  protected progress: BulkActionProgress;

  protected summary: BulkActionSummary;

  protected constructor(bulkAction) {
    this.bulkAction = bulkAction;
    this.progress = new BulkActionProgress();
    this.summary = new BulkActionSummary();
  }

  /**
   * Assign node client and calculate total keys
   * before run and not recalculate on any iteration
   */
  abstract prepareToStart();

  /**
   * Start bulk operation
   */
  abstract run();

  getProgress(): BulkActionProgress {
    return this.progress;
  }

  getSummary() {
    return this.summary;
  }
}
