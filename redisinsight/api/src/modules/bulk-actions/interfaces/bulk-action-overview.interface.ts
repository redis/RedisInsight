import {
  BulkActionStatus,
  BulkActionType,
} from 'src/modules/bulk-actions/constants';
import { IBulkActionProgressOverview } from './bulk-action-progress-overview.interface';
import { IBulkActionSummaryOverview } from './bulk-action-summary-overview.interface';
import { IBulkActionFilterOverview } from './bulk-action-filter-overview.interface';

export interface IBulkActionOverview {
  id: string;
  databaseId: string;
  duration: number;
  type: BulkActionType;
  status: BulkActionStatus; // Note: This can be null, according to the API response
  filter: IBulkActionFilterOverview; // Note: This can be null, according to the API response
  progress: IBulkActionProgressOverview;
  summary: IBulkActionSummaryOverview;
  downloadUrl?: string;
  error?: string;
}
