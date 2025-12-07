import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import { v4 as uuidv4 } from 'uuid';
import {
  mockEncryptionService,
  mockEncryptResult,
  mockQueryBuilderGetMany,
  mockQueryBuilderGetManyRaw,
  mockRepository,
  mockDatabase,
  MockType,
} from 'src/__mocks__';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DatabaseAnalysisProvider } from 'src/modules/database-analysis/providers/database-analysis.provider';
import { DatabaseAnalysis } from 'src/modules/database-analysis/models';
import {
  CreateDatabaseAnalysisDto,
  RecommendationVoteDto,
} from 'src/modules/database-analysis/dto';
import { RedisDataType } from 'src/modules/browser/keys/dto';
import { plainToInstance } from 'class-transformer';
import { ScanFilter } from 'src/modules/database-analysis/models/scan-filter';
import { DatabaseAnalysisEntity } from 'src/modules/database-analysis/entities/database-analysis.entity';
import { NotFoundException } from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { KeytarDecryptionErrorException } from 'src/modules/encryption/exceptions';

export const mockCreateDatabaseAnalysisDto: CreateDatabaseAnalysisDto = {
  delimiter: ':',
  filter: plainToInstance(ScanFilter, {
    type: RedisDataType.String,
    match: 'key*',
    count: 15,
  }),
};

const mockDatabaseAnalysisEntity = new DatabaseAnalysisEntity({
  id: uuidv4(),
  databaseId: mockDatabase.id,
  delimiter: mockCreateDatabaseAnalysisDto.delimiter,
  filter: 'ENCRYPTED:filter',
  totalKeys: 'ENCRYPTED:totalKeys',
  totalMemory: 'ENCRYPTED:totalMemory',
  topKeysNsp: 'ENCRYPTED:topKeysNsp',
  topMemoryNsp: 'ENCRYPTED:topMemoryNsp',
  topKeysLength: 'ENCRYPTED:topKeysLength',
  topKeysMemory: 'ENCRYPTED:topKeysMemory',
  expirationGroups: 'ENCRYPTED:expirationGroups',
  recommendations: 'ENCRYPTED:recommendations',
  encryption: 'KEYTAR',
  createdAt: new Date(),
});

const mockDatabaseAnalysisPartial: Partial<DatabaseAnalysis> = {
  ...mockCreateDatabaseAnalysisDto,
  databaseId: mockDatabase.id,
};

const mockDatabaseAnalysis = {
  ...mockDatabaseAnalysisPartial,
  id: mockDatabaseAnalysisEntity.id,
  createdAt: mockDatabaseAnalysisEntity.createdAt,
  totalKeys: {
    total: 1,
    types: [
      {
        type: 'string',
        total: 1,
      },
    ],
  },
  totalMemory: {
    total: 10,
    types: [
      {
        type: 'set',
        total: 10,
      },
    ],
  },
  topKeysNsp: [
    {
      nsp: Buffer.from('nsp1'),
      keys: 1,
      memory: 10,
      types: [
        {
          type: 'string',
          keys: 1,
          memory: 10,
        },
      ],
    },
  ],
  topMemoryNsp: [
    {
      nsp: Buffer.from('nsp1'),
      keys: 1,
      memory: 10,
      types: [
        {
          type: 'string',
          keys: 1,
          memory: 10,
        },
      ],
    },
  ],
  topKeysLength: [
    {
      name: Buffer.from('nsp1:key1'),
      type: 'string',
      memory: 10,
      length: 1,
      ttl: -1,
    },
  ],
  topKeysMemory: [
    {
      name: Buffer.from('nsp1:key1'),
      type: 'string',
      memory: 10,
      length: 1,
      ttl: -1,
    },
  ],
  expirationGroups: [
    {
      label: 'No Expire',
      threshold: 0,
      total: 200000,
    },
    {
      label: '<1 hr',
      threshold: 3600,
      total: 0,
    },
    {
      label: '1-4 Hrs',
      threshold: 14400,
      total: 0,
    },
    {
      label: '4-12 Hrs',
      threshold: 43200,
      total: 0,
    },
    {
      label: '12-24 Hrs',
      threshold: 86400,
      total: 0,
    },
    {
      label: '1-7 Days',
      threshold: 604800,
      total: 0,
    },
    {
      label: '>7 Days',
      threshold: 2592000,
      total: 0,
    },
    {
      label: '>1 Month',
      threshold: 9007199254740991,
      total: 0,
    },
  ],
  recommendations: [{ name: 'luaScript' }],
} as DatabaseAnalysis;

const mockDatabaseAnalysisWithVote = {
  ...mockDatabaseAnalysis,
  recommendations: [{ name: 'luaScript', vote: 'useful' }],
} as DatabaseAnalysis;

const mockRecommendationVoteDto: RecommendationVoteDto = {
  name: 'luaScript',
  vote: 'useful',
};

describe('DatabaseAnalysisProvider', () => {
  let service: DatabaseAnalysisProvider;
  let repository: MockType<Repository<DatabaseAnalysis>>;
  let encryptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseAnalysisProvider,
        {
          provide: getRepositoryToken(DatabaseAnalysisEntity),
          useFactory: mockRepository,
        },
        {
          provide: EncryptionService,
          useFactory: mockEncryptionService,
        },
      ],
    }).compile();

    service = module.get<DatabaseAnalysisProvider>(DatabaseAnalysisProvider);
    repository = module.get(getRepositoryToken(DatabaseAnalysisEntity));
    encryptionService = module.get<EncryptionService>(EncryptionService);

    // encryption mocks
    [
      'filter',
      'totalKeys',
      'totalMemory',
      'topKeysNsp',
      'topMemoryNsp',
      'topKeysLength',
      'topKeysMemory',
      'expirationGroups',
      'recommendations',
    ].forEach((field) => {
      when(encryptionService.encrypt)
        .calledWith(JSON.stringify(mockDatabaseAnalysis[field]))
        .mockReturnValue({
          ...mockEncryptResult,
          data: mockDatabaseAnalysisEntity[field],
        });
      when(encryptionService.decrypt)
        .calledWith(
          mockDatabaseAnalysisEntity[field],
          mockEncryptResult.encryption,
        )
        .mockReturnValue(JSON.stringify(mockDatabaseAnalysis[field]));
    });
  });

  describe('create', () => {
    it('should process new entity', async () => {
      repository.save.mockReturnValueOnce(mockDatabaseAnalysisEntity);
      expect(await service.create(mockDatabaseAnalysisPartial)).toEqual(
        mockDatabaseAnalysis,
      );
    });
  });

  describe('get', () => {
    it('should get analysis', async () => {
      repository.findOneBy.mockReturnValueOnce(mockDatabaseAnalysisEntity);

      expect(await service.get(mockDatabaseAnalysis.id)).toEqual(
        mockDatabaseAnalysis,
      );
    });
    it('should return null fields in case of decryption errors', async () => {
      when(encryptionService.decrypt)
        .calledWith(
          mockDatabaseAnalysisEntity['filter'],
          mockEncryptResult.encryption,
        )
        .mockRejectedValueOnce(new KeytarDecryptionErrorException());
      repository.findOneBy.mockReturnValueOnce(mockDatabaseAnalysisEntity);

      expect(await service.get(mockDatabaseAnalysis.id)).toEqual({
        ...mockDatabaseAnalysis,
        filter: null,
      });
    });
    it('should throw an error', async () => {
      repository.findOneBy.mockReturnValueOnce(null);

      try {
        await service.get(mockDatabaseAnalysis.id);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.DATABASE_ANALYSIS_NOT_FOUND);
      }
    });
  });

  describe('list', () => {
    it('should get list of analysis', async () => {
      mockQueryBuilderGetMany.mockReturnValueOnce([
        {
          id: mockDatabaseAnalysis.id,
          createdAt: mockDatabaseAnalysis.createdAt,
          notExposed: 'field',
        },
      ]);
      expect(await service.list(mockDatabaseAnalysis.databaseId)).toEqual([
        {
          id: mockDatabaseAnalysis.id,
          createdAt: mockDatabaseAnalysis.createdAt,
        },
      ]);
    });
  });

  describe('cleanupDatabaseHistory', () => {
    it('Should not return anything on cleanup', async () => {
      mockQueryBuilderGetManyRaw.mockReturnValueOnce([
        { id: mockDatabaseAnalysisEntity.id },
        { id: mockDatabaseAnalysisEntity.id },
      ]);

      expect(await service.cleanupDatabaseHistory(mockDatabase.id)).toEqual(
        undefined,
      );
    });
  });

  describe('recommendationVote', () => {
    it('should return updated database analysis', async () => {
      repository.findOneBy.mockReturnValueOnce(mockDatabaseAnalysisEntity);
      repository.update.mockReturnValueOnce(true);
      await encryptionService.encrypt.mockReturnValue(mockEncryptResult);

      expect(
        await service.recommendationVote(
          mockDatabaseAnalysis.id,
          mockRecommendationVoteDto,
        ),
      ).toEqual(mockDatabaseAnalysisWithVote);
    });

    it('should throw an error', async () => {
      repository.findOneBy.mockReturnValueOnce(null);

      try {
        await service.recommendationVote(
          mockDatabaseAnalysis.id,
          mockRecommendationVoteDto,
        );
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toEqual(ERROR_MESSAGES.DATABASE_ANALYSIS_NOT_FOUND);
      }
    });
  });
});
