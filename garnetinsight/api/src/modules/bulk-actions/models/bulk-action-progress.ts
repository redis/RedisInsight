import { IBulkActionProgressOverview } from 'src/modules/bulk-actions/interfaces/bulk-action-progress-overview.interface';

export class BulkActionProgress {
  private total: number = 0;

  private scanned: number = 0;

  private cursor: number = 0;

  setTotal(total) {
    this.total = total;
  }

  setCursor(cursor) {
    if (cursor === 0) {
      this.scanned = this.total;
      this.cursor = -1;
    } else {
      this.cursor = cursor;
    }
  }

  getCursor(): number {
    return this.cursor;
  }

  addScanned(scanned) {
    this.scanned += scanned;

    if (this.scanned > this.total) {
      this.scanned = this.total;
    }
  }

  getOverview(): IBulkActionProgressOverview {
    return {
      total: this.total,
      scanned: this.scanned,
    };
  }
}
