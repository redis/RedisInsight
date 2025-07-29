import { Test, TestingModule } from '@nestjs/testing';
import { BulkImportService } from 'src/modules/bulk-actions/bulk-import.service';
import {
  mockBulkActionsAnalytics,
  mockBulkActionOverviewMatcher,
  mockClientMetadata,
  mockClusterRedisClient,
  mockCombinedStream,
  mockDatabase,
  mockDatabaseClientFactory,
  mockDatabaseModules,
  mockDatabaseService,
  mockDefaultDataManifest,
  mockSessionMetadata,
  mockStandaloneRedisClient,
  MockType,
} from 'src/__mocks__';
import { BulkActionSummary } from 'src/modules/bulk-actions/models/bulk-action-summary';
import { IBulkActionOverview } from 'src/modules/bulk-actions/interfaces/bulk-action-overview.interface';
import {
  BulkActionStatus,
  BulkActionType,
} from 'src/modules/bulk-actions/constants';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { BulkActionsAnalytics } from 'src/modules/bulk-actions/bulk-actions.analytics';
import * as fs from 'fs-extra';
import * as CombinedStream from 'combined-stream';
import config from 'src/utils/config';
import { join } from 'path';
import { wrapHttpError } from 'src/common/utils';
import { RedisClientCommand } from 'src/modules/redis/client';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import { Readable } from 'stream';
import { DatabaseService } from 'src/modules/database/database.service';

const PATH_CONFIG = config.get('dir_path');

const generateNCommandsBuffer = (n: number) =>
  Buffer.from(
    new Array(n)
      .fill(1)
      .map(() => ['set', ['foo', 'bar']])
      .join('\n'),
  );
const generateNBatchCommands = (n: number): RedisClientCommand[] =>
  new Array(n).fill(1).map(() => ['set', 'foo', 'bar']);
const generateNBatchCommandsResults = (n: number) =>
  new Array(n).fill(1).map(() => [null, 'OK']);
const mockBatchCommands = generateNBatchCommands(100);
const mockBatchCommandsResult = generateNBatchCommandsResults(100);
const mockBatchCommandsResultWithErrors = [
  ...new Array(99).fill(1).map(() => [null, 'OK']),
  [new Error('ReplyError')],
];
const mockSummary: BulkActionSummary = Object.assign(new BulkActionSummary(), {
  processed: 100,
  succeed: 100,
  failed: 0,
  errors: [],
});

const mockEmptySummary: BulkActionSummary = Object.assign(
  new BulkActionSummary(),
  {
    processed: 0,
    succeed: 0,
    failed: 0,
    errors: [],
  },
);

const mockSummaryWithErrors = Object.assign(new BulkActionSummary(), {
  processed: 100,
  succeed: 99,
  failed: 1,
  errors: [],
});

const mockImportResult: IBulkActionOverview = {
  id: 'empty',
  databaseId: mockClientMetadata.databaseId,
  type: BulkActionType.Upload,
  summary: mockSummary.getOverview(),
  progress: null,
  filter: null,
  status: BulkActionStatus.Completed,
  duration: 100,
};

const mockEmptyImportResult: IBulkActionOverview = {
  id: 'empty',
  databaseId: mockClientMetadata.databaseId,
  type: BulkActionType.Upload,
  summary: mockEmptySummary.getOverview(),
  progress: null,
  filter: null,
  status: BulkActionStatus.Completed,
  duration: 0,
};

const mockReadableStream = Readable.from(Buffer.from('SET foo bar'));

const mockUploadImportFileByPathDto = {
  path: '/some/path',
};

jest.mock('fs-extra');
const mockedFs = fs as jest.Mocked<typeof fs>;

jest.mock('combined-stream');
const mockedCombinedStream = CombinedStream as jest.Mocked<
  typeof CombinedStream
>;

describe('BulkImportService', () => {
  let service: BulkImportService;
  let databaseClientFactory: MockType<DatabaseClientFactory>;
  let deviceService: MockType<DatabaseService>;
  let analytics: MockType<BulkActionsAnalytics>;

  beforeEach(async () => {
    jest.mock('fs-extra', () => mockedFs);
    jest.mock('combined-stream', () => mockedCombinedStream);
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BulkImportService,
        {
          provide: DatabaseClientFactory,
          useFactory: mockDatabaseClientFactory,
        },
        {
          provide: BulkActionsAnalytics,
          useFactory: mockBulkActionsAnalytics,
        },
        {
          provide: DatabaseService,
          useFactory: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get(BulkImportService);
    databaseClientFactory = module.get(DatabaseClientFactory);
    analytics = module.get(BulkActionsAnalytics);
    deviceService = module.get(DatabaseService);
  });

  describe('executeBatch', () => {
    it('should execute batch in pipeline for standalone', async () => {
      mockStandaloneRedisClient.sendPipeline.mockResolvedValueOnce(
        mockBatchCommandsResult,
      );
      expect(
        await service['executeBatch'](
          mockStandaloneRedisClient,
          mockBatchCommands,
        ),
      ).toEqual(mockSummary);
    });
    it('should execute batch in pipeline for standalone with errors', async () => {
      mockStandaloneRedisClient.sendPipeline.mockResolvedValueOnce(
        mockBatchCommandsResultWithErrors,
      );
      expect(
        await service['executeBatch'](
          mockStandaloneRedisClient,
          mockBatchCommands,
        ),
      ).toEqual(mockSummaryWithErrors);
    });
    it('should return all failed in case of global error', async () => {
      mockStandaloneRedisClient.sendPipeline.mockRejectedValueOnce(new Error());
      expect(
        await service['executeBatch'](
          mockStandaloneRedisClient,
          mockBatchCommands,
        ),
      ).toEqual({
        ...mockSummary.getOverview(),
        succeed: 0,
        failed: mockSummary.getOverview().processed,
      });
    });
    it('should execute batch of commands without pipeline for cluster', async () => {
      mockClusterRedisClient.call.mockRejectedValueOnce(new Error());
      mockClusterRedisClient.call.mockResolvedValue('OK');
      expect(
        await service['executeBatch'](
          mockClusterRedisClient,
          mockBatchCommands,
        ),
      ).toEqual(mockSummaryWithErrors);
    });
  });

  describe('import', () => {
    let spy;

    beforeEach(() => {
      spy = jest.spyOn(service as any, 'executeBatch');
    });

    it('should import data', async () => {
      spy.mockResolvedValue(mockSummary);
      expect(
        await service.import(mockClientMetadata, mockReadableStream),
      ).toEqual({
        ...mockImportResult,
        duration: expect.anything(),
      });
      expect(analytics.sendActionSucceed).toHaveBeenCalledWith(
        mockSessionMetadata,
        {
          ...mockImportResult,
          duration: expect.anything(),
        },
      );
    });

    it('should import data (100K) from file in batches 10K each', async () => {
      spy.mockResolvedValue(
        Object.assign(new BulkActionSummary(), {
          processed: 10_000,
          succeed: 10_000,
          failed: 0,
        }),
      );
      expect(
        await service.import(
          mockClientMetadata,
          Readable.from(generateNCommandsBuffer(100_000)),
        ),
      ).toEqual({
        ...mockImportResult,
        summary: {
          processed: 100_000,
          succeed: 100_000,
          failed: 0,
          errors: [],
          keys: [],
        },
        duration: expect.anything(),
      });
    });

    it('should import data (10K) from file in batches 10K each', async () => {
      spy.mockResolvedValue(
        Object.assign(new BulkActionSummary(), {
          processed: 10_000,
          succeed: 10_000,
          failed: 0,
        }),
      );
      expect(
        await service.import(
          mockClientMetadata,
          Readable.from(generateNCommandsBuffer(10_000)),
        ),
      ).toEqual({
        ...mockImportResult,
        summary: {
          processed: 10_000,
          succeed: 10_000,
          failed: 0,
          errors: [],
          keys: [],
        },
        duration: expect.anything(),
      });
    });

    it('should not import any data due to parse error', async () => {
      spy.mockResolvedValue(
        Object.assign(new BulkActionSummary(), {
          processed: 0,
          succeed: 0,
          failed: 0,
        }),
      );
      expect(
        await service.import(
          mockClientMetadata,
          Readable.from(Buffer.from('{"incorrectdata"}\n{"incorrectdata"}')),
        ),
      ).toEqual({
        ...mockImportResult,
        summary: {
          processed: 2,
          succeed: 0,
          failed: 2,
          errors: [],
          keys: [],
        },
        duration: expect.anything(),
      });
      expect(mockStandaloneRedisClient.disconnect).toHaveBeenCalled();
    });

    it('should ignore blank lines', async () => {
      await service.import(
        mockClientMetadata,
        Readable.from(
          Buffer.from('\n SET foo bar \n     \n SET foo bar \n    '),
        ),
      );
      expect(spy).toBeCalledWith(mockStandaloneRedisClient, [
        ['SET', 'foo', 'bar'],
        ['SET', 'foo', 'bar'],
      ]);
      expect(mockStandaloneRedisClient.disconnect).toHaveBeenCalled();
    });

    it('should throw an error in case of global error', async () => {
      try {
        databaseClientFactory.createClient.mockRejectedValueOnce(
          new NotFoundException(),
        );

        await service.import(mockClientMetadata, mockReadableStream);

        fail();
      } catch (e) {
        expect(mockStandaloneRedisClient.disconnect).not.toHaveBeenCalled();
        expect(analytics.sendActionFailed).toHaveBeenCalledWith(
          mockSessionMetadata,
          { ...mockEmptyImportResult },
          wrapHttpError(e),
        );
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('uploadFromTutorial', () => {
    let spy;

    beforeEach(() => {
      spy = jest.spyOn(service as any, 'import');
      spy.mockResolvedValue(mockSummary);
      mockedFs.readFile.mockResolvedValue(Buffer.from('set foo bar'));
    });

    it('should import file by path', async () => {
      mockedFs.pathExists.mockImplementationOnce(async () => true);

      await service.uploadFromTutorial(
        mockClientMetadata,
        mockUploadImportFileByPathDto,
      );

      expect(mockedFs.createReadStream).toHaveBeenCalledWith(
        join(PATH_CONFIG.homedir, mockUploadImportFileByPathDto.path),
      );
    });

    it('should import file by path with static', async () => {
      mockedFs.pathExists.mockImplementationOnce(async () => true);

      await service.uploadFromTutorial(mockClientMetadata, {
        path: '/static/guides/_data.file',
      });

      expect(mockedFs.createReadStream).toHaveBeenCalledWith(
        join(PATH_CONFIG.homedir, '/guides/_data.file'),
      );
    });

    it('should normalize path before importing and not search for file outside home folder', async () => {
      mockedFs.pathExists.mockImplementationOnce(async () => true);

      await service.uploadFromTutorial(mockClientMetadata, {
        path: '/../../../danger',
      });

      expect(mockedFs.createReadStream).toHaveBeenCalledWith(
        join(PATH_CONFIG.homedir, 'danger'),
      );
    });

    it('should normalize path before importing and throw an error when search for file outside home folder (relative)', async () => {
      mockedFs.pathExists.mockImplementationOnce(async () => true);

      try {
        await service.uploadFromTutorial(mockClientMetadata, {
          path: '../../../danger',
        });

        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual('Data file was not found');
      }
    });

    it('should throw BadRequest when no file found', async () => {
      mockedFs.pathExists.mockImplementationOnce(async () => false);

      try {
        await service.uploadFromTutorial(mockClientMetadata, {
          path: '../../../danger',
        });
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual('Data file was not found');
      }
    });
  });

  describe('importDefaultData', () => {
    let spy;

    beforeEach(() => {
      spy = jest.spyOn(service as any, 'import');
      spy.mockResolvedValue(mockSummary);
      mockedCombinedStream.create.mockReturnValue(mockCombinedStream);
    });

    it('should import default data for 2 known modules', async () => {
      mockedFs.readFileSync.mockImplementationOnce(() =>
        Buffer.from(JSON.stringify(mockDefaultDataManifest)),
      );
      mockedFs.createReadStream.mockImplementationOnce(
        () => new fs.ReadStream(),
      );
      deviceService.get.mockResolvedValue({
        ...mockDatabase,
        modules: mockDatabaseModules,
      });

      await service.importDefaultData(mockClientMetadata);

      expect(mockCombinedStream.append).toHaveBeenCalledTimes(4);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(mockClientMetadata, mockCombinedStream);
    });

    it('should import default data for search module', async () => {
      mockedFs.readFileSync.mockImplementationOnce(() =>
        Buffer.from(
          JSON.stringify({
            files: [
              {
                path: 'some-path',
                modules: ['search', 'searchlight', 'ft', 'ftl'],
              },
            ],
          }),
        ),
      );

      mockedFs.createReadStream.mockImplementationOnce(
        () => new fs.ReadStream(),
      );
      deviceService.get.mockResolvedValue({
        ...mockDatabase,
        modules: [
          {
            name: 'search',
            version: 999999,
            semanticVersion: '99.99.99',
          },
        ],
      });

      await service.importDefaultData(mockClientMetadata);

      expect(mockCombinedStream.append).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(mockClientMetadata, mockCombinedStream);
    });

    it('should import default data for searchlight module', async () => {
      mockedFs.readFileSync.mockImplementationOnce(() =>
        Buffer.from(
          JSON.stringify({
            files: [
              {
                path: 'some-path',
                modules: ['search', 'searchlight', 'ft', 'ftl'],
              },
            ],
          }),
        ),
      );

      mockedFs.createReadStream.mockImplementationOnce(
        () => new fs.ReadStream(),
      );
      deviceService.get.mockResolvedValue({
        ...mockDatabase,
        modules: [
          {
            name: 'searchlight',
            version: 999999,
            semanticVersion: '99.99.99',
          },
        ],
      });

      await service.importDefaultData(mockClientMetadata);

      expect(mockCombinedStream.append).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(mockClientMetadata, mockCombinedStream);
    });

    it('should import default data for core module only', async () => {
      mockedFs.readFileSync.mockImplementationOnce(() =>
        Buffer.from(JSON.stringify(mockDefaultDataManifest)),
      );
      mockedFs.createReadStream.mockImplementationOnce(
        () => new fs.ReadStream(),
      );
      deviceService.get.mockResolvedValue(mockDatabase);

      await service.importDefaultData(mockClientMetadata);

      expect(mockCombinedStream.append).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(mockClientMetadata, mockCombinedStream);
    });

    it('should throw an error in case when something went wrong', async () => {
      mockedFs.readFileSync.mockImplementationOnce(() => {
        throw new Error();
      });

      try {
        await service.importDefaultData(mockClientMetadata);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toEqual('Unable to import default data');
        expect(spy).toHaveBeenCalledTimes(0);
      }
    });
  });

  describe('importVectorCollection', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    beforeEach(() => {
      (mockedFs.pathExists as jest.Mock).mockReset();
      (mockedFs.createReadStream as jest.Mock).mockReset();
    });

    it('should import vector collection successfully', async () => {
      const spy = jest.spyOn(service, 'import');
      spy.mockResolvedValue(mockBulkActionOverviewMatcher);

      (mockedFs.pathExists as jest.Mock).mockResolvedValue(true);
      (mockedFs.createReadStream as jest.Mock).mockReturnValue(new Readable());

      const result = await service.importVectorCollection(mockClientMetadata, {
        collection: 'bikes',
      });

      expect(mockedFs.pathExists).toHaveBeenCalledWith(
        expect.stringContaining('vector-collections/bikes'),
      );
      expect(mockedFs.createReadStream).toHaveBeenCalledWith(
        expect.stringContaining('vector-collections/bikes'),
      );
      expect(spy).toHaveBeenCalledWith(
        mockClientMetadata,
        expect.any(Readable),
      );
      expect(result).toEqual(mockBulkActionOverviewMatcher);
    });

    it('should throw BadRequestException when collection file does not exist', async () => {
      (mockedFs.pathExists as jest.Mock).mockResolvedValue(false);

      await expect(
        service.importVectorCollection(mockClientMetadata, {
          collection: 'bikes',
        }),
      ).rejects.toThrow('No data file found for collection: bikes');

      expect(mockedFs.pathExists).toHaveBeenCalledWith(
        expect.stringContaining('vector-collections/bikes'),
      );
    });

    it('should handle import errors', async () => {
      const spy = jest.spyOn(service, 'import');
      const importError = new Error('Import failed');
      spy.mockRejectedValue(importError);

      (mockedFs.pathExists as jest.Mock).mockResolvedValue(true);
      (mockedFs.createReadStream as jest.Mock).mockReturnValue(new Readable());

      await expect(
        service.importVectorCollection(mockClientMetadata, {
          collection: 'bikes',
        }),
      ).rejects.toThrow('Import failed');

      expect(spy).toHaveBeenCalledWith(
        mockClientMetadata,
        expect.any(Readable),
      );
    });

    it('should throw BadRequestException when collection name is not in allowed list', async () => {
      await expect(
        service.importVectorCollection(mockClientMetadata, {
          collection: '../../etc/passwd', // malicious input
        }),
      ).rejects.toThrow('Invalid collection name');
    });
  });
});
