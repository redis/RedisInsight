import {
  BulkActionStatus,
  BulkActionType,
} from 'src/modules/bulk-actions/constants';
import { BulkActionFilter } from 'src/modules/bulk-actions/models/bulk-action-filter';
import { BulkActionProgress } from 'src/modules/bulk-actions/models/bulk-action-progress';
import { BulkActionSummary } from 'src/modules/bulk-actions/models/bulk-action-summary';

export const mockCreateBulkActionDto = {
  id: 'bulk-action-id',
  databaseId: 'database-id',
  type: BulkActionType.Delete,
};

export const mockBulkActionOverview = {
  ...mockCreateBulkActionDto,
  duration: 100,
  filter: { match: '*', type: null },
  progress: {
    scanned: 0,
    total: 0,
  },
  status: BulkActionStatus.Completed,
  summary: {
    failed: 0,
    processed: 0,
    succeed: 0,
    errors: [],
    keys: [],
  },
};

export const mockDefaultDataManifest = {
  files: [
    {
      path: 'test_common',
    },
    {
      path: 'test_json',
      modules: ['rejson'],
    },
    {
      path: 'not_existing',
      modules: ['not_existing_module'],
    },
  ],
};

export const mockCombinedStream = {
  append: jest.fn(),
};

export const mockBulkActionOverviewMatcher = {
  ...mockBulkActionOverview,
  duration: expect.any(Number),
};

export const mockBulkActionFilter = new BulkActionFilter();

const mockKey = 'mockedKey';
const mockKeyBuffer = Buffer.from(mockKey);
const mockRESPError = 'Reply Error: NOPERM for delete.';
const mockRESPErrorBuffer = Buffer.from(mockRESPError);

export const generateMockBulkActionErrors = (amount: number, raw = true): any =>
  new Array(amount).fill(1).map(() => ({
    key: raw ? mockKeyBuffer : mockKey,
    error: raw ? mockRESPErrorBuffer : mockRESPError,
  }));

export const generateMockBulkActionProgress = () => {
  const progress = new BulkActionProgress();

  progress['total'] = 1_000_000;
  progress['scanned'] = 1_000_000;

  return progress;
};

export const generateMockBulkActionSummary = () => {
  const summary = new BulkActionSummary();

  summary['processed'] = 1_000_000;
  summary['succeed'] = 900_000;
  summary['failed'] = 100_000;
  summary['errors'] = generateMockBulkActionErrors(500);

  return summary;
};

export const mockBulkActionsAnalytics = () => ({
  sendActionStarted: jest.fn(),
  sendActionStopped: jest.fn(),
  sendActionSucceed: jest.fn(),
  sendActionFailed: jest.fn(),
  sendImportSamplesUploaded: jest.fn(),
});
