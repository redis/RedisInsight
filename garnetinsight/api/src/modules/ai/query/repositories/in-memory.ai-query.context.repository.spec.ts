import { Test, TestingModule } from '@nestjs/testing';
import {
  mockAiQueryAccountId,
  mockAiQueryDatabaseId,
  mockAiQueryFullDbContext,
  mockAiQueryIndex,
  mockAiQueryIndexContext,
  mockSessionMetadata,
} from 'src/__mocks__';
import { InMemoryAiQueryContextRepository } from 'src/modules/ai/query/repositories/in-memory.ai-query.context.repository';

describe('InMemoryAiQueryContextRepository', () => {
  let service: InMemoryAiQueryContextRepository;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [InMemoryAiQueryContextRepository],
    }).compile();

    service = module.get(InMemoryAiQueryContextRepository);
  });

  it('should return null since no data cached', async () => {
    await expect(
      service.getFullDbContext(
        mockSessionMetadata,
        mockAiQueryDatabaseId,
        mockAiQueryAccountId,
      ),
    ).resolves.toEqual(null);

    await expect(
      service.getIndexContext(
        mockSessionMetadata,
        mockAiQueryDatabaseId,
        mockAiQueryAccountId,
        mockAiQueryIndex,
      ),
    ).resolves.toEqual(null);
  });

  it('should return cached data', async () => {
    await service.setFullDbContext(
      mockSessionMetadata,
      mockAiQueryDatabaseId,
      mockAiQueryAccountId,
      mockAiQueryFullDbContext,
    );

    await service.setIndexContext(
      mockSessionMetadata,
      mockAiQueryDatabaseId,
      mockAiQueryAccountId,
      mockAiQueryIndex,
      mockAiQueryIndexContext,
    );

    await service.setFullDbContext(mockSessionMetadata, '2', '2', {});

    await expect(
      service.getFullDbContext(
        mockSessionMetadata,
        mockAiQueryDatabaseId,
        mockAiQueryAccountId,
      ),
    ).resolves.toEqual(mockAiQueryFullDbContext);

    await expect(
      service.getFullDbContext(mockSessionMetadata, '2', '2'),
    ).resolves.toEqual({});
  });

  it('should return cached index context data', async () => {
    await service.setIndexContext(
      mockSessionMetadata,
      mockAiQueryDatabaseId,
      mockAiQueryAccountId,
      mockAiQueryIndex,
      mockAiQueryIndexContext,
    );

    await service.setFullDbContext(
      mockSessionMetadata,
      mockAiQueryDatabaseId,
      mockAiQueryAccountId,
      mockAiQueryFullDbContext,
    );

    await service.setFullDbContext(mockSessionMetadata, '2', '2', {
      full: 'context',
    });

    await service.setIndexContext(mockSessionMetadata, '2', '2', '2', {});

    await service.setIndexContext(mockSessionMetadata, '2', '2', '3', {
      index: '3',
    });

    await expect(
      service.getIndexContext(
        mockSessionMetadata,
        mockAiQueryDatabaseId,
        mockAiQueryAccountId,
        mockAiQueryIndex,
      ),
    ).resolves.toEqual(mockAiQueryIndexContext);

    await expect(
      service.getFullDbContext(
        mockSessionMetadata,
        mockAiQueryDatabaseId,
        mockAiQueryAccountId,
      ),
    ).resolves.toEqual(mockAiQueryFullDbContext);

    await expect(
      service.getIndexContext(mockSessionMetadata, '2', '2', '2'),
    ).resolves.toEqual({});
    await expect(
      service.getIndexContext(mockSessionMetadata, '2', '2', '3'),
    ).resolves.toEqual({ index: '3' });
    await expect(
      service.getIndexContext(mockSessionMetadata, '2', '2', '4'),
    ).resolves.toEqual(null);

    // reset
    await expect(
      service.reset(
        mockSessionMetadata,
        mockAiQueryDatabaseId,
        mockAiQueryAccountId,
      ),
    ).resolves.toEqual(undefined);

    await expect(
      service.getIndexContext(
        mockSessionMetadata,
        mockAiQueryDatabaseId,
        mockAiQueryAccountId,
        mockAiQueryIndex,
      ),
    ).resolves.toEqual(null);

    await expect(
      service.getFullDbContext(
        mockSessionMetadata,
        mockAiQueryDatabaseId,
        mockAiQueryAccountId,
      ),
    ).resolves.toEqual(null);

    await expect(
      service.getIndexContext(mockSessionMetadata, '2', '2', '2'),
    ).resolves.toEqual({});
    await expect(
      service.getIndexContext(mockSessionMetadata, '2', '2', '3'),
    ).resolves.toEqual({ index: '3' });
    await expect(
      service.getIndexContext(mockSessionMetadata, '2', '2', '4'),
    ).resolves.toEqual(null);
  });
});
