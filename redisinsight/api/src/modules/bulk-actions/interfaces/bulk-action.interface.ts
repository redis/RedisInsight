import { BulkActionStatus } from 'src/modules/bulk-actions/constants';
import { BulkActionFilter } from 'src/modules/bulk-actions/models/bulk-action-filter';
import { Socket } from 'socket.io';

export interface IBulkAction {
  getStatus(): BulkActionStatus;
  getFilter(): BulkActionFilter;
  changeState(): void;
  getSocket(): Socket;
  writeToReport(keyName: string, success: boolean, error?: string): void;
}
