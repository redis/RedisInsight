import { BulkActionStatus } from 'src/modules/bulk-actions/constants';
import { AbstractBulkActionRunner } from 'src/modules/bulk-actions/models/runners/abstract.bulk-action.runner';
import {
  RedisClient,
  RedisClientCommand,
  RedisClientCommandReply,
} from 'src/modules/redis/client';
import { getTotalKeys } from 'src/modules/redis/utils';

export abstract class AbstractBulkActionSimpleRunner extends AbstractBulkActionRunner {
  protected node: RedisClient;

  constructor(bulkAction, node) {
    super(bulkAction);
    this.node = node;
  }

  /**
   * Commands to be executed in a pipeline
   * @param keys
   */
  abstract prepareCommands(keys: Buffer[]): RedisClientCommand[];

  /**
   * @inheritDoc
   */
  async prepareToStart() {
    this.progress.setTotal(await getTotalKeys(this.node));
  }

  /**
   * @inheritDoc
   */
  async run() {
    while (
      this.progress.getCursor() > -1 &&
      this.bulkAction.getStatus() === BulkActionStatus.Running
    ) {
      await this.runIteration();
    }
  }

  /**
   * Just run single iteration for some batch of keys and process results
   */
  async runIteration() {
    const keys = await this.getKeysToProcess();
    this.progress.addScanned(this.bulkAction.getFilter().getCount());

    if (keys.length) {
      const commands = this.prepareCommands(keys);
      const res = await this.node.sendPipeline(commands);
      this.processIterationResults(keys, res);
    }

    this.bulkAction.changeState();
  }

  /**
   * Get batch of keys to process
   */
  async getKeysToProcess(): Promise<Buffer[]> {
    if (this.progress.getCursor() < 0) {
      return [];
    }
    // @ts-ignore
    const [cursorBuffer, keys] = await this.node.sendCommand([
      'scan',
      this.progress.getCursor(),
      ...this.bulkAction.getFilter().getScanArgsArray(),
    ]);

    const cursor = parseInt(cursorBuffer, 10);
    this.progress.setCursor(cursor);

    return keys;
  }

  /**
   * Process results
   * @param keys
   * @param res
   */
  processIterationResults(
    keys: Buffer[],
    res: [Error | null, RedisClientCommandReply][],
  ) {
    this.summary.addProcessed(res.length);

    const errors = [];

    res.forEach(([err], i) => {
      const keyName = keys[i].toString();

      if (err) {
        errors.push({ key: keys[i], error: err.message });
        // Write error to report stream
        this.bulkAction.writeToReport(keyName, false, err.message);
      } else {
        this.summary.addSuccess(1);
        // Write success to report stream
        this.bulkAction.writeToReport(keyName, true);
      }
    });

    this.summary.addErrors(errors);
  }
}
