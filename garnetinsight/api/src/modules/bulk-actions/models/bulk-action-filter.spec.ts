import { BulkActionFilter } from 'src/modules/bulk-actions/models/bulk-action-filter';
import { RedisDataType } from 'src/modules/browser/keys/dto';

describe('BulkActionSummary', () => {
  let filter: BulkActionFilter;

  beforeEach(() => {
    filter = new BulkActionFilter();
  });

  describe('getScanArgsArray', () => {
    it('should get arguments for scan without type', async () => {
      expect(filter.getScanArgsArray()).toEqual([
        'count',
        10_000,
        'match',
        '*',
      ]);
      expect(filter.getCount()).toEqual(10_000);
    });
    it('should get arguments for scan with type', async () => {
      filter.match = 'device:*';
      filter.type = RedisDataType.Set;
      filter.count = 9_999;
      expect(filter.getScanArgsArray()).toEqual([
        'count',
        9_999,
        'match',
        'device:*',
        'type',
        RedisDataType.Set,
      ]);
      expect(filter.getCount()).toEqual(9_999);
    });
  });
});
