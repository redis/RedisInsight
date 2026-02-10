import { BrowserToolKeysCommands } from 'src/modules/browser/constants/browser-tool-commands';
import { AbstractBulkActionSimpleRunner } from 'src/modules/bulk-actions/models/runners/simple/abstract.bulk-action.simple.runner';
import { RedisClientCommand } from 'src/modules/redis/client';

export class DeleteBulkActionSimpleRunner extends AbstractBulkActionSimpleRunner {
  prepareCommands(keys: Buffer[]): RedisClientCommand[] {
    return keys.map((key) => [BrowserToolKeysCommands.Del, key]);
  }
}
