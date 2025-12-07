import { BulkActionProgress } from 'src/modules/bulk-actions/models/bulk-action-progress';

describe('BulkActionSummary', () => {
  let progress: BulkActionProgress;

  beforeEach(() => {
    progress = new BulkActionProgress();
    progress.setTotal(10_000);
  });

  describe('setTotal', () => {
    it('should set total', async () => {
      expect(progress['total']).toEqual(10_000);

      progress.setTotal(30_0000);

      expect(progress['total']).toEqual(30_0000);
    });
  });

  describe('setCursor + getCursor', () => {
    it('should set cursor and change scanned when cursor = 0', async () => {
      expect(progress['total']).toEqual(10_000);
      expect(progress['scanned']).toEqual(0);
      expect(progress['cursor']).toEqual(0);
      expect(progress.getCursor()).toEqual(0);

      progress.setCursor(1000);

      expect(progress['total']).toEqual(10_000);
      expect(progress['scanned']).toEqual(0);
      expect(progress['cursor']).toEqual(1000);
      expect(progress.getCursor()).toEqual(1000);

      progress.setCursor(0);

      expect(progress['total']).toEqual(10_000);
      expect(progress['scanned']).toEqual(10_000);
      expect(progress['cursor']).toEqual(-1);
      expect(progress.getCursor()).toEqual(-1);
    });
  });

  describe('addScanned + getOverview', () => {
    it('should add scanned but not more than total', async () => {
      expect(progress['total']).toEqual(10_000);
      expect(progress['scanned']).toEqual(0);
      expect(progress.getOverview()).toEqual({
        total: 10_000,
        scanned: 0,
      });

      progress.addScanned(1000);

      expect(progress['total']).toEqual(10_000);
      expect(progress['scanned']).toEqual(1000);
      expect(progress.getOverview()).toEqual({
        total: 10_000,
        scanned: 1_000,
      });

      progress.addScanned(200_000);

      expect(progress['total']).toEqual(10_000);
      expect(progress['scanned']).toEqual(10_000);
      expect(progress.getOverview()).toEqual({
        total: 10_000,
        scanned: 10_000,
      });
    });
  });
});
