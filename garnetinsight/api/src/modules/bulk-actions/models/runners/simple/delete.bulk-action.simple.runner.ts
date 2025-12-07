import { AbstractBulkActionSimpleRunner } from 'src/modules/bulk-actions/models/runners/simple/abstract.bulk-action.simple.runner';
import { RedisClientCommand } from 'src/modules/redis/client';

export class DeleteBulkActionSimpleRunner extends AbstractBulkActionSimpleRunner {
  prepareCommands(keys: Buffer[]): RedisClientCommand[] {
    return keys.map((key) => ['del', key]);
  }
}
