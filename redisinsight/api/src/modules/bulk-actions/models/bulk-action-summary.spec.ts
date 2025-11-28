import { BulkActionSummary } from 'src/modules/bulk-actions/models/bulk-action-summary';

const mockKey = 'mockedKey';
const mockKeyBuffer = Buffer.from(mockKey);
const mockRESPError = 'Reply Error: NOPERM for delete.';
const mockRESPErrorBuffer = Buffer.from(mockRESPError);

const generateErrors = (amount: number): any =>
  new Array(amount).fill(1).map(() => ({
    key: mockKeyBuffer,
    error: mockRESPErrorBuffer,
  }));

describe('BulkActionSummary', () => {
  let summary: BulkActionSummary;

  beforeEach(() => {
    summary = new BulkActionSummary();
  });

  describe('addProcessed', () => {
    it('should increase processed', async () => {
      expect(summary['processed']).toEqual(0);

      summary.addProcessed(1);

      expect(summary['processed']).toEqual(1);

      summary.addProcessed(100);

      expect(summary['processed']).toEqual(101);
    });
  });
  describe('addSuccess', () => {
    it('should increase succeed', async () => {
      expect(summary['succeed']).toEqual(0);

      summary.addSuccess(1);

      expect(summary['succeed']).toEqual(1);

      summary.addSuccess(100);

      expect(summary['succeed']).toEqual(101);
    });
  });
  describe('addFailed', () => {
    it('should increase failed', async () => {
      expect(summary['failed']).toEqual(0);

      summary.addFailed(1);

      expect(summary['failed']).toEqual(1);

      summary.addFailed(100);

      expect(summary['failed']).toEqual(101);
    });
  });
  describe('addErrors', () => {
    it('should increase fails and store errors (up to 500)', async () => {
      expect(summary['failed']).toEqual(0);

      summary.addErrors([]);

      expect(summary['failed']).toEqual(0);

      summary.addErrors(generateErrors(1));

      expect(summary['failed']).toEqual(1);
      expect(summary['errors']).toEqual(generateErrors(1));

      summary.addErrors(generateErrors(100));

      expect(summary['failed']).toEqual(101);
      expect(summary['errors']).toEqual(generateErrors(101));

      summary.addErrors(generateErrors(1000));

      expect(summary['failed']).toEqual(1101);
      expect(summary['errors']).toEqual(generateErrors(500));
    });
  });
  describe('addKeys', () => {
    it('should add keys', async () => {
      expect(summary['keys']).toEqual([]);

      summary.addKeys([Buffer.from('key1')]);

      expect(summary['keys']).toEqual([Buffer.from('key1')]);

      summary.addKeys([Buffer.from('key2'), Buffer.from('key3')]);

      expect(summary['keys']).toEqual([
        Buffer.from('key1'),
        Buffer.from('key2'),
        Buffer.from('key3'),
      ]);
    });
  });
  describe('getOverview', () => {
    it('should get overview and clear errors', async () => {
      expect(summary['processed']).toEqual(0);
      expect(summary['succeed']).toEqual(0);
      expect(summary['failed']).toEqual(0);
      expect(summary['errors']).toEqual([]);
      expect(summary['keys']).toEqual([]);

      summary.addProcessed(1500);
      summary.addSuccess(500);
      summary.addErrors(generateErrors(1000));

      expect(summary.getOverview()).toEqual({
        processed: 1500,
        succeed: 500,
        failed: 1000,
        errors: generateErrors(500),
        keys: [],
      });

      expect(summary['processed']).toEqual(1500);
      expect(summary['succeed']).toEqual(500);
      expect(summary['failed']).toEqual(1000);
      expect(summary['errors']).toEqual([]);
    });
  });
});
