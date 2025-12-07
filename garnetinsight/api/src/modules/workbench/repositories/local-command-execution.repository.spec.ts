import { Test, TestingModule } from '@nestjs/testing';
import { when } from 'jest-when';
import {
  mockEncryptionService,
  mockRepository,
  MockType,
  mockSessionMetadata,
  mockCommandExecutionEntity,
  mockCommandExecution,
  mockCommendExecutionHugeResultPlaceholder,
  mockCommendExecutionHugeResultPlaceholderEncrypted,
  mockShortCommandExecutionEntity,
  mockShortCommandExecution,
  mockCommandExecutionFilter,
} from 'src/__mocks__';
import { CommandExecutionStatus } from 'src/modules/cli/dto/cli.dto';
import { NotFoundException } from '@nestjs/common';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CommandExecutionEntity } from 'src/modules/workbench/entities/command-execution.entity';
import { KeytarDecryptionErrorException } from 'src/modules/encryption/exceptions';
import ERROR_MESSAGES from 'src/constants/error-messages';
import config from 'src/utils/config';
import { LocalCommandExecutionRepository } from 'src/modules/workbench/repositories/local-command-execution.repository';

const WORKBENCH_CONFIG = config.get('workbench');

describe('LocalCommandExecutionRepository', () => {
  let service: LocalCommandExecutionRepository;
  let repository: MockType<Repository<CommandExecutionEntity>>;
  let encryptionService: MockType<EncryptionService>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalCommandExecutionRepository,
        {
          provide: getRepositoryToken(CommandExecutionEntity),
          useFactory: mockRepository,
        },
        {
          provide: EncryptionService,
          useFactory: mockEncryptionService,
        },
      ],
    }).compile();

    service = module.get(LocalCommandExecutionRepository);
    repository = module.get(getRepositoryToken(CommandExecutionEntity));
    encryptionService = module.get(EncryptionService);

    when(encryptionService.encrypt)
      .calledWith(mockCommandExecution.command)
      .mockResolvedValue({
        data: mockCommandExecutionEntity.command,
        encryption: mockCommandExecutionEntity.encryption,
      })
      .calledWith(JSON.stringify(mockCommandExecution.result))
      .mockResolvedValue({
        data: mockCommandExecutionEntity.result,
        encryption: mockCommandExecutionEntity.encryption,
      })
      .calledWith(JSON.stringify([mockCommendExecutionHugeResultPlaceholder]))
      .mockResolvedValue({
        data: mockCommendExecutionHugeResultPlaceholderEncrypted,
        encryption: mockCommandExecutionEntity.encryption,
      });

    when(encryptionService.decrypt)
      .calledWith(mockCommandExecutionEntity.command, expect.anything())
      .mockResolvedValue(mockCommandExecution.command)
      .calledWith(mockCommandExecutionEntity.result, expect.anything())
      .mockResolvedValue(JSON.stringify(mockCommandExecution.result));

    repository.save.mockReturnValue(mockCommandExecutionEntity);
    repository.findOneBy.mockReturnValue(mockCommandExecutionEntity);
  });

  describe('create', () => {
    let cleanupSpy: jest.SpyInstance;

    beforeEach(() => {
      cleanupSpy = jest.spyOn(service as any, 'cleanupDatabaseHistory');
    });

    it('should process new entity', async () => {
      expect(
        await service.createMany(mockSessionMetadata, [
          {
            ...mockCommandExecution,
            id: undefined,
            createdAt: undefined,
          },
        ]),
      ).toEqual([mockCommandExecution]);
      expect(repository.save).toHaveBeenCalledWith({
        ...mockCommandExecutionEntity,
        id: undefined,
        createdAt: undefined,
      });
      expect(cleanupSpy).toBeCalledTimes(1);
      expect(cleanupSpy).toHaveBeenCalledWith(mockCommandExecution.databaseId, {
        type: mockCommandExecution.type,
      });
    });
    it('should return full result even if size limit exceeded', async () => {
      const executionResult = [
        {
          status: CommandExecutionStatus.Success,
          response: `${Buffer.alloc(WORKBENCH_CONFIG.maxResultSize, 'a').toString()}`,
        },
      ];

      expect(
        await service.createMany(mockSessionMetadata, [
          {
            ...mockCommandExecution,
            result: executionResult,
          },
        ]),
      ).toEqual([
        {
          ...mockCommandExecution,
          result: executionResult,
          isNotStored: true, // double check that for such cases special flag returned
        },
      ]);
      expect(repository.save).toHaveBeenCalledWith({
        ...mockCommandExecutionEntity,
        command: mockCommandExecutionEntity.command,
        result: mockCommendExecutionHugeResultPlaceholderEncrypted,
      });
    });
  });
  describe('getList', () => {
    it('should return list (2) of command execution', async () => {
      repository
        .createQueryBuilder()
        .getMany.mockReturnValueOnce([
          mockShortCommandExecutionEntity,
          mockShortCommandExecutionEntity,
        ]);

      expect(
        await service.getList(
          mockSessionMetadata,
          mockCommandExecutionEntity.databaseId,
          mockCommandExecutionFilter,
        ),
      ).toEqual([mockShortCommandExecution, mockShortCommandExecution]);
      expect(repository.createQueryBuilder().where).toHaveBeenCalledWith({
        databaseId: mockCommandExecution.databaseId,
        type: mockCommandExecutionFilter.type,
      });
    });
    it('should return list (1) of command execution without failed decrypted item', async () => {
      repository.createQueryBuilder().getMany.mockResolvedValueOnce([
        mockShortCommandExecutionEntity,
        {
          ...mockShortCommandExecutionEntity,
          command: 'something that can not be decrypted',
        },
      ]);
      encryptionService.decrypt.mockResolvedValueOnce(
        mockShortCommandExecution.command,
      );
      encryptionService.decrypt.mockRejectedValueOnce(
        new KeytarDecryptionErrorException(),
      );

      expect(
        await service.getList(
          mockSessionMetadata,
          mockCommandExecution.databaseId,
          mockCommandExecutionFilter,
        ),
      ).toEqual([mockShortCommandExecution]);
    });
  });
  describe('getOne', () => {
    it('should return decrypted and transformed command execution', async () => {
      expect(
        await service.getOne(
          mockSessionMetadata,
          mockCommandExecution.databaseId,
          mockCommandExecution.id,
        ),
      ).toEqual(mockCommandExecution);
      expect(repository.findOneBy).toHaveBeenCalledWith({
        id: mockCommandExecution.id,
        databaseId: mockCommandExecution.databaseId,
      });
    });
    it('should return null fields in case of decryption errors', async () => {
      encryptionService.decrypt.mockReturnValueOnce(
        mockCommandExecution.command,
      );
      encryptionService.decrypt.mockRejectedValueOnce(
        new KeytarDecryptionErrorException(),
      );

      expect(
        await service.getOne(
          mockSessionMetadata,
          mockCommandExecution.databaseId,
          mockCommandExecution.id,
        ),
      ).toEqual({
        ...mockCommandExecution,
        result: null,
      });
    });
    it('should return not found exception', async () => {
      repository.findOneBy.mockResolvedValueOnce(null);

      await expect(
        service.getOne(
          mockSessionMetadata,
          mockCommandExecution.databaseId,
          mockCommandExecution.id,
        ),
      ).rejects.toEqual(
        new NotFoundException(ERROR_MESSAGES.COMMAND_EXECUTION_NOT_FOUND),
      );
    });
  });
  describe('delete', () => {
    it('Should not return anything on delete', async () => {
      repository.delete.mockResolvedValueOnce(1);
      expect(
        await service.delete(
          mockSessionMetadata,
          mockCommandExecution.databaseId,
          mockCommandExecution.id,
        ),
      ).toEqual(undefined);
      expect(repository.delete).toHaveBeenCalledWith({
        id: mockCommandExecution.id,
        databaseId: mockCommandExecution.databaseId,
      });
    });
  });
  describe('deleteAll', () => {
    it('Should not return anything on delete', async () => {
      repository.delete.mockResolvedValueOnce(1);
      expect(
        await service.deleteAll(
          mockSessionMetadata,
          mockCommandExecution.databaseId,
          mockCommandExecutionFilter,
        ),
      ).toEqual(undefined);
      expect(repository.delete).toHaveBeenCalledWith({
        databaseId: mockCommandExecution.databaseId,
        type: mockCommandExecutionFilter.type,
      });
    });
  });
  describe('cleanupDatabaseHistory', () => {
    it('Should should not return anything on cleanup', async () => {
      repository
        .createQueryBuilder()
        .getRawMany.mockReturnValueOnce([
          { id: mockCommandExecutionEntity.id },
          { id: mockCommandExecutionEntity.id },
        ]);

      expect(
        await service['cleanupDatabaseHistory'](
          mockCommandExecution.databaseId,
          mockCommandExecutionFilter,
        ),
      ).toEqual(undefined);
      expect(repository.createQueryBuilder().where).toHaveBeenCalledWith({
        databaseId: mockCommandExecution.databaseId,
        type: mockCommandExecutionFilter.type,
      });
      expect(repository.createQueryBuilder().whereInIds).toHaveBeenCalledWith([
        mockCommandExecutionEntity.id,
        mockCommandExecutionEntity.id,
      ]);
    });
  });
});
