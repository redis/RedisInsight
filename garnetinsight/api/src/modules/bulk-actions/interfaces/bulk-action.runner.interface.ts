import { BulkActionProgress } from 'src/modules/bulk-actions/models/bulk-action-progress';
import { BulkActionSummary } from 'src/modules/bulk-actions/models/bulk-action-summary';

export interface IBulkActionRunner {
  prepareToStart(): void;
  run(): void;
  getProgress(): BulkActionProgress;
  getSummary(): BulkActionSummary;
}
