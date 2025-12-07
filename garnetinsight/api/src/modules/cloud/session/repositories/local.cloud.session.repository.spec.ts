import {
  MockType,
  mockCloudSessionData,
  mockCloudSessionEntity,
  mockEncryptionService,
  mockRepository,
} from 'src/__mocks__';
import { Repository } from 'typeorm';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { when } from 'jest-when';
import { LocalCloudSessionRepository } from './local.cloud.session.repository';
import { CloudSessionEntity } from '../entities/cloud.session.entity';
import { CloudAuthIdpType } from '../../auth/models';

describe('LocalCloudSessionRepository', () => {
  let service: LocalCloudSessionRepository;
  let repository: MockType<Repository<CloudSessionEntity>>;
  let encryptionService: MockType<EncryptionService>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalCloudSessionRepository,
        {
          provide: getRepositoryToken(CloudSessionEntity),
          useFactory: mockRepository,
        },
        {
          provide: EncryptionService,
          useFactory: mockEncryptionService,
        },
      ],
    }).compile();

    service = module.get(LocalCloudSessionRepository);
    encryptionService = module.get(EncryptionService);
    repository = module.get(getRepositoryToken(CloudSessionEntity));

    encryptionService.decrypt.mockImplementation((value) => value);
    when(encryptionService.decrypt)
      .calledWith(mockCloudSessionEntity.data, expect.anything())
      .mockResolvedValue(JSON.stringify(mockCloudSessionData.data));

    encryptionService.encrypt.mockImplementation((value) => value);
    when(encryptionService.encrypt)
      .calledWith(JSON.stringify(mockCloudSessionData.data))
      .mockResolvedValue({
        data: mockCloudSessionEntity.data,
        encryption: mockCloudSessionEntity.encryption,
      });
  });

  describe('get', () => {
    it('should return null if no cloud session data in the repository', async () => {
      await expect(service.get()).resolves.toEqual(null);
    });

    it('should return cloudSession data if it is in the repository', async () => {
      repository.findOneBy.mockResolvedValue(mockCloudSessionEntity);
      await expect(service.get()).resolves.toEqual(mockCloudSessionData);
    });
  });

  describe('save', () => {
    it('should upsert data into repository', async () => {
      repository.upsert.mockResolvedValue(mockCloudSessionEntity);

      await expect(
        service.save({ data: { idpType: CloudAuthIdpType.Google } }),
      ).resolves.toEqual(undefined);
    });

    it('encrypts the data before upsertion', async () => {
      await service.save({ data: { idpType: CloudAuthIdpType.Google } });

      expect(repository.upsert).toHaveBeenCalledWith(mockCloudSessionEntity, [
        'id',
      ]);
    });

    it('not fail when null data is stored', async () => {
      await expect(service.save({ data: null })).resolves.toEqual(undefined);
    });
  });
});
