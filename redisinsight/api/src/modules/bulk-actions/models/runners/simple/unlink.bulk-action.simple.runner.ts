import { BrowserToolKeysCommands } from 'src/modules/browser/constants/browser-tool-commands';
import { AbstractBulkActionSimpleRunner } from 'src/modules/bulk-actions/models/runners/simple/abstract.bulk-action.simple.runner';
import { RedisClientCommand, RedisFeature } from 'src/modules/redis/client';

export class UnlinkBulkActionSimpleRunner extends AbstractBulkActionSimpleRunner {
  private useDelFallback = false;

  /**
   * @inheritDoc
   * Check if UNLINK command is supported, fall back to DEL if not
   */
  async prepareToStart(): Promise<void> {
    await super.prepareToStart();

    // Check if UNLINK is supported (Redis 4.0.0+)
    // If not, fall back to DEL command for Redis 3.x compatibility
    const isUnlinkSupported = await this.node.isFeatureSupported(
      RedisFeature.UnlinkCommand,
    );
    this.useDelFallback = !isUnlinkSupported;
  }

  prepareCommands(keys: Buffer[]): RedisClientCommand[] {
    const command = this.useDelFallback
      ? BrowserToolKeysCommands.Del
      : BrowserToolKeysCommands.Unlink;
    return keys.map((key) => [command, key]);
  }
}
