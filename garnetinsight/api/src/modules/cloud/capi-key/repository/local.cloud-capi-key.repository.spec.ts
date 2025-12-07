import { when } from 'jest-when';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { pick } from 'lodash';
import {
  mockFeatureEntity,
  mockRepository,
  MockType,
  mockDatabase,
  mockCloudApiCapiKey,
  mockEncryptionService,
  mockCloudCapiKeyEntity,
  mockCapiKeyEncrypted,
  mockCapiSecretEncrypted,
  mockCloudCapiAuthDto,
  mockCloudCapiKey,
} from 'src/__mocks__';
import { LocalCloudCapiKeyRepository } from 'src/modules/cloud/capi-key/repository/local.cloud-capi-key.repository';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { KeytarDecryptionErrorException } from 'src/modules/encryption/exceptions';
import { CloudCapiKeyEntity } from 'src/modules/cloud/capi-key/entity/cloud-capi-key.entity';
import { CloudApiBadRequestException } from 'src/modules/cloud/common/exceptions';

describe('LocalCloudCapiKeyRepository', () => {
  let service: LocalCloudCapiKeyRepository;
  let repository: MockType<Repository<CloudCapiKeyEntity>>;
  let encryptionService: MockType<EncryptionService>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalCloudCapiKeyRepository,
        {
          provide: getRepositoryToken(CloudCapiKeyEntity),
          useFactory: mockRepository,
        },
        {
          provide: EncryptionService,
          useFactory: mockEncryptionService,
        },
      ],
    }).compile();

    repository = await module.get(getRepositoryToken(CloudCapiKeyEntity));
    service = await module.get(LocalCloudCapiKeyRepository);
    encryptionService = await module.get(EncryptionService);

    repository.findOneBy.mockResolvedValue(mockCloudCapiKeyEntity);
    repository.find.mockResolvedValue([
      mockCloudCapiKeyEntity,
      mockCloudCapiKeyEntity,
    ]);
    repository.save.mockResolvedValue(mockCloudCapiKeyEntity);
    repository.delete.mockResolvedValue({ deleted: 1 });
    repository.merge.mockResolvedValue(mockCloudApiCapiKey);
    repository
      .createQueryBuilder()
      .getMany.mockResolvedValue([
        pick(mockCloudCapiKey, 'id', 'name', 'valid', 'createdAt', 'lastUsed'),
        pick(mockCloudCapiKey, 'id', 'name', 'valid', 'createdAt', 'lastUsed'),
      ]);
    repository.merge.mockReturnValue(mockFeatureEntity);

    when(encryptionService.decrypt)
      .calledWith(mockCapiKeyEncrypted, expect.anything())
      .mockResolvedValue(mockCloudCapiAuthDto.capiKey)
      .calledWith(mockCapiSecretEncrypted, expect.anything())
      .mockResolvedValue(mockCloudCapiAuthDto.capiSecret);

    when(encryptionService.encrypt)
      .calledWith(mockCloudCapiAuthDto.capiKey)
      .mockResolvedValue({
        data: mockCapiKeyEncrypted,
        encryption: mockCloudCapiKeyEntity.encryption,
      })
      .calledWith(mockCloudCapiAuthDto.capiSecret)
      .mockResolvedValue({
        data: mockCapiSecretEncrypted,
        encryption: mockCloudCapiKeyEntity.encryption,
      });
  });

  describe('get', () => {
    it('should return decrypted and transformed capi key', async () => {
      expect(await service.get(mockDatabase.id)).toEqual(mockCloudCapiKey);
    });
    it('should return null fields in case of decryption errors', async () => {
      when(encryptionService.decrypt)
        .calledWith(mockCapiKeyEncrypted, expect.anything())
        .mockRejectedValueOnce(new KeytarDecryptionErrorException());

      expect(await service.get(mockDatabase.id)).toEqual({
        ...mockCloudCapiKey,
        capiKey: null,
      });
    });
    it('should return null', async () => {
      repository.findOneBy.mockResolvedValueOnce(null);

      expect(await service.get(mockDatabase.id)).toEqual(null);
    });
  });

  describe('update', () => {
    it('should return features', async () => {
      const result = await service.update('id', mockCloudCapiKey);

      expect(result).toEqual(mockCloudCapiKey);
    });
  });

  describe('getByUserAccount', () => {
    it('should return decrypted and transformed capi key', async () => {
      const result = await service.getByUserAccount(
        mockCloudCapiKey.userId,
        mockCloudCapiKey.cloudUserId,
        mockCloudCapiKey.cloudAccountId,
      );

      expect(result).toEqual(mockCloudCapiKey);
    });

    it('should return null', async () => {
      repository.findOneBy.mockResolvedValueOnce(null);

      const result = await service.getByUserAccount(
        mockCloudCapiKey.userId,
        mockCloudCapiKey.cloudUserId,
        mockCloudCapiKey.cloudAccountId,
      );

      expect(result).toEqual(null);
    });
  });

  describe('create', () => {
    it('should delete and do not return anything', async () => {
      const result = await service.create(mockCloudCapiKey);

      expect(result).toEqual(mockCloudCapiKey);
    });

    it('should throw CloudApiBadRequestException ON SQL constraint error', async () => {
      const constraintError: any = new Error('FOREIGN_KEY error');
      constraintError.code = 'SQLITE_CONSTRAINT';

      repository.save.mockRejectedValueOnce(constraintError);

      try {
        await service.create(mockCloudCapiKey);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(CloudApiBadRequestException);
        expect(e.message).toEqual('Such capi key already exists');
      }
    });

    it('should throw error', async () => {
      const constraintError: any = new Error('error');
      constraintError.code = 'custom_code';

      repository.save.mockRejectedValueOnce(constraintError);

      try {
        await service.create(mockCloudCapiKey);
        fail();
      } catch (e) {
        expect(e.message).toEqual('error');
      }
    });
  });

  describe('list', () => {
    it('should delete and do not return anything', async () => {
      const result = await service.list(mockCloudCapiKey.userId);

      expect(result).toEqual([
        pick(mockCloudCapiKey, 'id', 'name', 'valid', 'createdAt', 'lastUsed'),
        pick(mockCloudCapiKey, 'id', 'name', 'valid', 'createdAt', 'lastUsed'),
      ]);
    });
  });

  describe('delete', () => {
    it('should delete and do not return anything', async () => {
      const result = await service.delete(
        mockCloudCapiKey.userId,
        mockCloudCapiKey.id,
      );

      expect(result).toEqual(undefined);
    });
  });

  describe('deleteAll', () => {
    it('should delete and do not return anything', async () => {
      const result = await service.deleteAll(mockCloudCapiKey.userId);

      expect(result).toEqual(undefined);
    });
  });
});
