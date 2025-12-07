import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  mockRepository,
  mockSessionMetadata,
  mockSettings,
  mockSettingsEntity,
  MockType,
  mockUserId,
} from 'src/__mocks__';
import { LocalSettingsRepository } from 'src/modules/settings/repositories/local.settings.repository';
import { SettingsEntity } from 'src/modules/settings/entities/settings.entity';

describe('LocalSettingsRepository', () => {
  let service: LocalSettingsRepository;
  let repository: MockType<Repository<SettingsEntity>>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalSettingsRepository,
        {
          provide: getRepositoryToken(SettingsEntity),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    repository = await module.get(getRepositoryToken(SettingsEntity));
    service = await module.get(LocalSettingsRepository);

    repository.findOneBy.mockResolvedValue(mockSettingsEntity);
    repository.update.mockResolvedValue(true); // no meter of response
    repository.save.mockResolvedValue(
      Object.assign(new SettingsEntity(), { id: mockUserId }),
    );
    repository.create.mockReturnValue(new SettingsEntity());
  });

  describe('getOrCreate', () => {
    it('should return settings model', async () => {
      const result = await service.getOrCreate();

      expect(result).toEqual(mockSettings);
    });
    it('should create new settings', async () => {
      repository.findOneBy.mockResolvedValueOnce(null);

      const result = await service.getOrCreate();

      expect(result).toEqual({
        ...mockSettings,
        data: undefined,
      });
    });
    it('should fail to create with unique constraint and return existing', async () => {
      repository.findOneBy.mockResolvedValueOnce(null);
      repository.findOneBy.mockResolvedValueOnce(mockSettings);
      repository.save.mockRejectedValueOnce({ code: 'SQLITE_CONSTRAINT' });

      const result = await service.getOrCreate();

      expect(result).toEqual(mockSettings);
    });
    it('should fail when failed to create new and error is not unique constraint', async () => {
      repository.findOneBy.mockResolvedValueOnce(null);
      repository.save.mockRejectedValueOnce(new Error());

      await expect(service.getOrCreate()).rejects.toThrow(Error);
    });
  });

  describe('update', () => {
    it('should update settings', async () => {
      const result = await service.update(mockSessionMetadata, mockSettings);

      expect(result).toEqual(mockSettings);
      expect(repository.save).toHaveBeenCalledWith(mockSettingsEntity);
    });
  });
});
