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
    it('should add keys when under limit', async () => {
      const keys = [Buffer.from('key1'), Buffer.from('key2')];

      summary.addKeys(keys);

      expect(summary['keys']).toEqual(keys);
      expect(summary['totalKeysProcessed']).toEqual(2);
      expect(summary['hasMoreKeys']).toBe(false);
    });

    it('should limit stored keys when exceeding default limit', async () => {
      // Create many keys to exceed the default limit of 10,000
      const keys = Array.from({ length: 15000 }, (_, i) =>
        Buffer.from(`key${i}`),
      );

      summary.addKeys(keys);

      expect(summary['keys']).toHaveLength(10000); // Default limit
      expect(summary['totalKeysProcessed']).toEqual(15000);
      expect(summary['hasMoreKeys']).toBe(true);
    });

    it('should handle multiple addKeys calls with default limit', async () => {
      // Add keys in batches that exceed the default limit
      const batch1 = Array.from({ length: 8000 }, (_, i) =>
        Buffer.from(`key${i}`),
      );
      const batch2 = Array.from({ length: 5000 }, (_, i) =>
        Buffer.from(`key${i + 8000}`),
      );

      summary.addKeys(batch1);
      expect(summary['keys']).toHaveLength(8000);
      expect(summary['totalKeysProcessed']).toEqual(8000);
      expect(summary['hasMoreKeys']).toBe(false);

      summary.addKeys(batch2);
      expect(summary['keys']).toHaveLength(10000); // Default limit
      expect(summary['totalKeysProcessed']).toEqual(13000);
      expect(summary['hasMoreKeys']).toBe(true);
    });

    it('should handle partial batch when approaching default limit', async () => {
      // Add keys close to the limit
      const batch1 = Array.from({ length: 9999 }, (_, i) =>
        Buffer.from(`key${i}`),
      );
      const batch2 = [Buffer.from('key9999'), Buffer.from('key10000')];

      summary.addKeys(batch1);
      expect(summary['keys']).toHaveLength(9999);
      expect(summary['totalKeysProcessed']).toEqual(9999);
      expect(summary['hasMoreKeys']).toBe(false);

      summary.addKeys(batch2);
      expect(summary['keys']).toHaveLength(10000); // Default limit
      expect(summary['totalKeysProcessed']).toEqual(10001);
      expect(summary['hasMoreKeys']).toBe(true);
    });

    it('should use default limit from configuration', async () => {
      expect(summary['maxStoredKeys']).toEqual(10_000);
    });

    it('should handle empty keys array', async () => {
      summary.addKeys([]);

      expect(summary['keys']).toEqual([]);
      expect(summary['totalKeysProcessed']).toEqual(0);
      expect(summary['hasMoreKeys']).toBe(false);
    });

    it('should handle large number of keys efficiently', async () => {
      const largeKeySet = Array.from({ length: 15000 }, (_, i) =>
        Buffer.from(`key${i}`),
      );

      summary.addKeys(largeKeySet);

      expect(summary['keys']).toHaveLength(10000); // Default limit
      expect(summary['totalKeysProcessed']).toEqual(15000);
      expect(summary['hasMoreKeys']).toBe(true);

      // Verify only first 10000 keys are stored
      expect(summary['keys'][0]).toEqual(Buffer.from('key0'));
      expect(summary['keys'][9999]).toEqual(Buffer.from('key9999'));
    });
  });

  describe('getOverview', () => {
    it('should get overview and clear errors', async () => {
      expect(summary['processed']).toEqual(0);
      expect(summary['succeed']).toEqual(0);
      expect(summary['failed']).toEqual(0);
      expect(summary['errors']).toEqual([]);

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

    it('should return only stored keys in overview (not internal fields)', async () => {
      const keys = Array.from({ length: 15000 }, (_, i) =>
        Buffer.from(`key${i}`),
      );

      summary.addKeys(keys);
      summary.addProcessed(15000);
      summary.addSuccess(15000);

      const overview = summary.getOverview();

      // Should only contain the interface fields, not internal tracking fields
      expect(overview.processed).toEqual(15000);
      expect(overview.succeed).toEqual(15000);
      expect(overview.failed).toEqual(0);
      expect(overview.errors).toEqual([]);
      expect(overview.keys).toHaveLength(10000); // Default limit

      // Internal fields should not be exposed
      expect(overview).not.toHaveProperty('totalKeysProcessed');
      expect(overview).not.toHaveProperty('hasMoreKeys');
      expect(overview).not.toHaveProperty('maxStoredKeys');
    });
  });

  describe('memory management integration', () => {
    it('should maintain consistent state across operations', async () => {
      const batch1 = Array.from({ length: 5000 }, (_, i) =>
        Buffer.from(`key${i}`),
      );
      summary.addKeys(batch1);
      summary.addProcessed(5000);
      summary.addSuccess(5000);

      // Add more keys that exceed default limit
      const batch2 = Array.from({ length: 8000 }, (_, i) =>
        Buffer.from(`key${i + 5000}`),
      );
      summary.addKeys(batch2);
      summary.addProcessed(8000);
      summary.addSuccess(7000);
      summary.addFailed(1000);

      const overview = summary.getOverview();

      expect(overview.processed).toEqual(13000);
      expect(overview.succeed).toEqual(12000);
      expect(overview.failed).toEqual(1000);
      expect(overview.keys).toHaveLength(10000); // Default limit
      expect(summary['totalKeysProcessed']).toEqual(13000);
      expect(summary['hasMoreKeys']).toBe(true);
    });
  });
});
