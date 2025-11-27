import { BulkActionStatus } from 'src/modules/bulk-actions/constants';
import { BulkActionFilter } from 'src/modules/bulk-actions/models/bulk-action-filter';
import { Socket } from 'socket.io';
import { RedisString } from 'src/common/constants';

export interface IBulkAction {
  getStatus(): BulkActionStatus;
  getFilter(): BulkActionFilter;
  changeState(): void;
  getSocket(): Socket;
  emitDeletedKeys(keys: RedisString[]): void;
}
