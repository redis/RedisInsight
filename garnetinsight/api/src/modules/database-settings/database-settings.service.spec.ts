import { Test, TestingModule } from '@nestjs/testing';
import {
  mockDatabaseId,
  mockDatabaseSettingsCreateDto,
  mockDatabaseSettingsDto,
  mockDatabaseSettingsEntity,
  mockDatabaseSettingsRepository,
  mockSessionMetadata,
  MockType,
} from 'src/__mocks__';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { DatabaseSettingsService } from './database-settings.service';
import { DatabaseSettingsRepository } from './repositories/database-settings.repository';

describe('DatabaseSettingsService', () => {
  let service: DatabaseSettingsService;
  let repository: MockType<DatabaseSettingsRepository>;
  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseSettingsService,
        {
          provide: DatabaseSettingsRepository,
          useFactory: mockDatabaseSettingsRepository,
        },
      ],
    }).compile();
    service = await module.get(DatabaseSettingsService);
    repository = await module.get(DatabaseSettingsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get', () => {
    it('should return database settings entity when it exists', async () => {
      const expected = mockDatabaseSettingsDto();
      repository.get.mockResolvedValue(expected);
      const actual = await service.get(mockSessionMetadata, mockDatabaseId);
      expect(actual).toEqual(expected);
      expect(repository.get).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockDatabaseId,
      );
    });

    it('should throw NotFoundException when database setting is not found', async () => {
      repository.get.mockRejectedValueOnce(
        new NotFoundException(ERROR_MESSAGES.DATABASE_SETTINGS_NOT_FOUND),
      );
      await expect(
        service.get(mockSessionMetadata, mockDatabaseId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createOrUpdate', () => {
    it('should create new database settings entity when it does not exist', async () => {
      const expected = mockDatabaseSettingsDto();
      repository.createOrUpdate.mockResolvedValueOnce(expected);
      const actual = await service.createOrUpdate(
        mockSessionMetadata,
        mockDatabaseId,
        mockDatabaseSettingsCreateDto,
      );
      expect(actual).toEqual(expected);
      expect(repository.createOrUpdate).toHaveBeenCalled();
    });

    it('should update existing database settings entity', async () => {
      repository.createOrUpdate.mockResolvedValue({
        ...mockDatabaseSettingsEntity,
        data: { treeViewSort: '1' },
      });
      const updateDto = {
        ...mockDatabaseSettingsCreateDto,
        data: { treeViewSort: '1' },
      };
      const result = await service.createOrUpdate(
        mockSessionMetadata,
        mockDatabaseId,
        updateDto,
      );
      expect(result.data).toEqual({ treeViewSort: '1' });
      expect(repository.createOrUpdate).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete database settings entity', async () => {
      await expect(
        service.delete(mockSessionMetadata, mockDatabaseId),
      ).resolves.not.toThrow();
      expect(repository.delete).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockDatabaseId,
      );
    });

    it('should throw when database setting is not found', async () => {
      repository.delete.mockImplementationOnce(() => {
        throw new InternalServerErrorException('Error');
      });
      await expect(
        service.delete(mockSessionMetadata, mockDatabaseId),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
