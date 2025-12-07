import {
  mockDatabaseId,
  mockDatabaseSettingsDto,
  mockDatabaseSettingsEntity,
  mockRepository,
  mockSessionMetadata,
  MockType,
} from 'src/__mocks__';
import { Repository } from 'typeorm';
import { DatabaseSettingsEntity } from 'src/modules/database-settings/entities/database-setting.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { LocalDatabaseSettingsRepository } from './local-database-settings.repository';

describe('LocalDatabaseSettingsRepository', () => {
  let localDbRepository: LocalDatabaseSettingsRepository;
  let repository: MockType<Repository<DatabaseSettingsEntity>>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalDatabaseSettingsRepository,
        {
          provide: getRepositoryToken(DatabaseSettingsEntity),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    repository = await module.get(getRepositoryToken(DatabaseSettingsEntity));
    localDbRepository = module.get(LocalDatabaseSettingsRepository);

    repository.findOneBy.mockResolvedValue(mockDatabaseSettingsEntity);
    repository.save.mockResolvedValue(mockDatabaseSettingsEntity);
    repository.delete.mockImplementation(() => {});
  });

  it('should be defined', () => {
    expect(localDbRepository).toBeDefined();
  });

  describe('get', () => {
    it('should return database settings entity', async () => {
      const actual = await localDbRepository.get(
        mockSessionMetadata,
        mockDatabaseId,
      );
      const expected = mockDatabaseSettingsDto();
      expect(actual).toEqual(expected);
    });

    it('should throw when database setting is not found', async () => {
      repository.findOneBy.mockResolvedValueOnce(null);
      await expect(
        localDbRepository.get(mockSessionMetadata, mockDatabaseId),
      ).rejects.toThrow(NotFoundException);
    });
  });
  describe('createOrUpdate', () => {
    it('should be able to create database settings entity', async () => {
      repository.findOneBy.mockResolvedValueOnce(null);
      const actual = await localDbRepository.createOrUpdate(
        mockSessionMetadata,
        mockDatabaseSettingsDto(),
      );
      const expected = mockDatabaseSettingsDto();
      expect(actual).toEqual(expected);
    });

    it('should be able to update database setting', async () => {
      const update = mockDatabaseSettingsDto();
      update.data = { treeViewSort: '1' };
      expect(
        await localDbRepository.createOrUpdate(mockSessionMetadata, update),
      ).toEqual(mockDatabaseSettingsDto());
    });
  });
  describe('delete', () => {
    it('should delete database settings entity', async () => {
      await expect(
        localDbRepository.delete(mockSessionMetadata, mockDatabaseId),
      ).resolves.not.toThrow();
    });

    it('should throw when database setting is not found', async () => {
      repository.delete.mockImplementationOnce(() => {
        throw new Error('Error');
      });
      await expect(
        localDbRepository.delete(mockSessionMetadata, mockDatabaseId),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
