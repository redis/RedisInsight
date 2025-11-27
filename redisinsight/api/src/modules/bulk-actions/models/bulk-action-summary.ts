import { RedisString } from 'src/common/constants';
import { IBulkActionSummaryOverview } from 'src/modules/bulk-actions/interfaces/bulk-action-summary-overview.interface';
import config, { Config } from 'src/utils/config';

const BULK_ACTIONS_CONFIG = config.get(
  'bulk_actions',
) as Config['bulk_actions'];

export class BulkActionSummary {
  private processed: number = 0;

  private succeed: number = 0;

  private failed: number = 0;

  private errors: Array<Record<string, string>> = [];

  private keys: Array<RedisString> = [];

  private totalKeysProcessed: number = 0;

  private readonly maxStoredKeys: number = BULK_ACTIONS_CONFIG.summaryKeysLimit;

  addProcessed(count: number) {
    this.processed += count;
  }

  addSuccess(count: number) {
    this.succeed += count;
  }

  addFailed(count: number) {
    this.failed += count;
  }

  addErrors(err: Array<Record<string, string>>) {
    if (err.length) {
      this.failed += err.length;

      this.errors = err.concat(this.errors).slice(0, 500);
    }
  }

  addKeys(keys: Array<RedisString>) {
    this.totalKeysProcessed += keys.length;

    const remaining = this.maxStoredKeys - this.keys.length;

    if (remaining > 0) {
      const keysToStore = keys.slice(0, remaining);
      this.keys.push(...keysToStore);
    }
  }

  getOverview(): IBulkActionSummaryOverview {
    const overview = {
      processed: this.processed,
      succeed: this.succeed,
      failed: this.failed,
      errors: this.errors,
      keys: this.keys,
    };

    this.errors = [];

    return overview;
  }
}
