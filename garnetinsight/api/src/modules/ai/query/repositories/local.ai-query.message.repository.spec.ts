import { Test, TestingModule } from '@nestjs/testing';
import {
  mockAiQueryAccountId,
  mockAiQueryAiResponse,
  mockAiQueryAiResponse2,
  mockAiQueryAiResponseEntity,
  mockAiQueryAiResponseEntity2,
  mockAiQueryDatabaseId,
  mockAiQueryHumanMessage,
  mockAiQueryHumanMessage2,
  mockAiQueryHumanMessageEntity,
  mockAiQueryHumanMessageEntity2,
  mockEncryptionService,
  mockRepository,
  mockSessionMetadata,
  MockType,
} from 'src/__mocks__';
import { when } from 'jest-when';
import { LocalAiQueryMessageRepository } from 'src/modules/ai/query/repositories/local.ai-query.message.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AiQueryMessageEntity } from 'src/modules/ai/query/entities/ai-query.message.entity';
import { Repository } from 'typeorm';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { KeytarEncryptionErrorException } from 'src/modules/encryption/exceptions';

describe('LocalAiQueryAuthProvider', () => {
  let service: LocalAiQueryMessageRepository;
  let repository: MockType<Repository<AiQueryMessageEntity>>;
  let encryptionService: MockType<EncryptionService>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalAiQueryMessageRepository,
        {
          provide: getRepositoryToken(AiQueryMessageEntity),
          useFactory: mockRepository,
        },
        {
          provide: EncryptionService,
          useFactory: mockEncryptionService,
        },
      ],
    }).compile();

    service = module.get(LocalAiQueryMessageRepository);
    encryptionService = module.get(EncryptionService);
    repository = module.get(getRepositoryToken(AiQueryMessageEntity));

    encryptionService.decrypt.mockImplementation((value) => value);
    when(encryptionService.decrypt)
      .calledWith(mockAiQueryHumanMessageEntity.content, expect.anything())
      .mockResolvedValue(mockAiQueryHumanMessage.content)
      .calledWith(mockAiQueryAiResponseEntity.content, expect.anything())
      .mockResolvedValue(mockAiQueryAiResponse.content)
      .calledWith(mockAiQueryAiResponseEntity.steps, expect.anything())
      .mockResolvedValue(JSON.stringify(mockAiQueryAiResponse.steps));

    encryptionService.encrypt.mockImplementation((value) => value);
    when(encryptionService.encrypt)
      .calledWith(mockAiQueryHumanMessage.content, expect.anything())
      .mockResolvedValue(mockAiQueryHumanMessageEntity.content)
      .calledWith(mockAiQueryAiResponse.content, expect.anything())
      .mockResolvedValue(mockAiQueryAiResponseEntity.content)
      .calledWith(
        JSON.stringify(mockAiQueryAiResponse.steps),
        expect.anything(),
      )
      .mockResolvedValue(mockAiQueryAiResponseEntity.steps);
  });

  describe('cleanupDatabaseHistory', () => {
    beforeEach(() => {
      repository
        .createQueryBuilder()
        .getRawMany.mockResolvedValueOnce([mockAiQueryHumanMessage.id]);
    });

    it('should get id to and remove it', async () => {
      await expect(
        service['cleanupDatabaseHistory'](
          mockAiQueryDatabaseId,
          mockAiQueryAccountId,
        ),
      ).resolves.toEqual(undefined);
    });
  });

  describe('list', () => {
    beforeEach(() => {
      repository
        .createQueryBuilder()
        .getMany.mockResolvedValueOnce([
          mockAiQueryHumanMessageEntity,
          mockAiQueryAiResponseEntity,
          mockAiQueryHumanMessageEntity2,
          mockAiQueryAiResponseEntity2,
        ]);
    });

    it('should return list of messages', async () => {
      await expect(
        service.list(
          mockSessionMetadata,
          mockAiQueryDatabaseId,
          mockAiQueryAccountId,
        ),
      ).resolves.toEqual([
        mockAiQueryHumanMessage,
        mockAiQueryAiResponse,
        mockAiQueryHumanMessage2,
        mockAiQueryAiResponse2,
      ]);
    });

    it('should ignore messages on decryption error', async () => {
      encryptionService.decrypt.mockRejectedValueOnce(
        new Error('Unable to decrypt'),
      );

      await expect(
        service.list(
          mockSessionMetadata,
          mockAiQueryDatabaseId,
          mockAiQueryAccountId,
        ),
      ).resolves.toEqual([
        mockAiQueryAiResponse,
        mockAiQueryHumanMessage2,
        mockAiQueryAiResponse2,
      ]);
    });
  });

  describe('createMany', () => {
    it('should 2 messages', async () => {
      await expect(
        service.createMany(mockSessionMetadata, [
          mockAiQueryHumanMessage,
          mockAiQueryAiResponse,
        ]),
      ).resolves.toEqual(undefined);
    });

    it('should reject on encryption error', async () => {
      encryptionService.encrypt.mockRejectedValueOnce(
        new KeytarEncryptionErrorException(),
      );

      await expect(
        service.createMany(mockSessionMetadata, [
          mockAiQueryHumanMessage,
          mockAiQueryAiResponse,
        ]),
      ).rejects.toEqual(new KeytarEncryptionErrorException());
    });
  });

  describe('clearHistory', () => {
    it('should clear history', async () => {
      await expect(
        service.clearHistory(
          mockSessionMetadata,
          mockAiQueryDatabaseId,
          mockAiQueryAccountId,
        ),
      ).resolves.toEqual(undefined);
    });
  });
});
