import { RedisString } from 'src/common/constants';

export interface IBulkActionSummaryOverview {
  processed: number;
  succeed: number;
  failed: number;
  errors: Array<Record<string, string>>;
  keys: Array<RedisString>;
}
