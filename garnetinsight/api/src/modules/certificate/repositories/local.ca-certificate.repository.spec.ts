import { when } from 'jest-when';
import { pick } from 'lodash';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import {
  mockCaCertificate,
  mockCaCertificateCertificateEncrypted,
  mockCaCertificateCertificatePlain,
  mockCaCertificateEntity,
  mockCaCertificateId,
  mockEncryptionService,
  mockRepository,
  MockType,
} from 'src/__mocks__';
import { LocalCaCertificateRepository } from 'src/modules/certificate/repositories/local.ca-certificate.repository';
import { CaCertificateEntity } from 'src/modules/certificate/entities/ca-certificate.entity';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { DatabaseEntity } from 'src/modules/database/entities/database.entity';

describe('LocalCaCertificateRepository', () => {
  let service: LocalCaCertificateRepository;
  let encryptionService: MockType<EncryptionService>;
  let repository: MockType<Repository<CaCertificateEntity>>;
  let databaseRepository: MockType<Repository<DatabaseEntity>>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalCaCertificateRepository,
        {
          provide: getRepositoryToken(CaCertificateEntity),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(DatabaseEntity),
          useFactory: mockRepository,
        },
        {
          provide: EncryptionService,
          useFactory: mockEncryptionService,
        },
      ],
    }).compile();

    repository = await module.get(getRepositoryToken(CaCertificateEntity));
    databaseRepository = await module.get(getRepositoryToken(DatabaseEntity));
    encryptionService = await module.get(EncryptionService);
    service = await module.get(LocalCaCertificateRepository);

    repository.findOneBy.mockResolvedValue(mockCaCertificateEntity);
    repository
      .createQueryBuilder()
      .getMany.mockResolvedValue([
        pick(mockCaCertificateEntity, 'id', 'name'),
        pick(mockCaCertificateEntity, 'id', 'name'),
      ]);
    repository.save.mockResolvedValue(mockCaCertificateEntity);
    repository.create.mockReturnValue(mockCaCertificate); // not entity since it happens before encryption

    when(encryptionService.decrypt)
      .calledWith(mockCaCertificateCertificateEncrypted, expect.anything())
      .mockResolvedValue(mockCaCertificateCertificatePlain);
    when(encryptionService.encrypt)
      .calledWith(mockCaCertificateCertificatePlain)
      .mockResolvedValue({
        data: mockCaCertificateCertificateEncrypted,
        encryption: mockCaCertificateEntity.encryption,
      });
  });

  describe('get', () => {
    it('should return ca certificate model', async () => {
      const result = await service.get(mockCaCertificateId);

      expect(result).toEqual(mockCaCertificate);
    });
  });

  describe('list', () => {
    it('should return ca certificates list', async () => {
      const result = await service.list();

      expect(result).toEqual([
        pick(mockCaCertificate, 'id', 'name'),
        pick(mockCaCertificate, 'id', 'name'),
      ]);
    });
  });

  describe('create', () => {
    it('should create ca certificate', async () => {
      repository.findOneBy.mockResolvedValueOnce(null);

      const result = await service.create(mockCaCertificate);

      expect(result).toEqual(mockCaCertificate);
    });

    it('should throw an error when ca certificate with such name already exists', async () => {
      try {
        await service.create(mockCaCertificate);
        fail();
      } catch (e) {
        // todo: why not ConflictException?
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual(ERROR_MESSAGES.CA_CERT_EXIST);
        expect(repository.save).not.toHaveBeenCalled();
      }
    });

    it('should ignore unique check when explicitly disabled via flag', async () => {
      const result = await service.create(mockCaCertificate, false);

      expect(result).toEqual(mockCaCertificate);
    });
  });

  describe('delete', () => {
    it('should delete ca certificate and return affected databases', async () => {
      const mockId = 'mock-ca-cert-id';
      const mockAffectedDatabases = ['db1', 'db2'];

      // Mock findOneBy to return a certificate
      repository.findOneBy.mockResolvedValue(mockCaCertificate);
      databaseRepository
        .createQueryBuilder()
        .getMany.mockResolvedValue(mockAffectedDatabases.map((id) => ({ id })));

      // Mock delete operation
      repository.delete.mockResolvedValue(undefined);

      const result = await service.delete(mockId);

      expect(result).toEqual({ affectedDatabases: mockAffectedDatabases });
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: mockId });
      expect(databaseRepository.createQueryBuilder).toHaveBeenCalledWith('d');
      expect(
        databaseRepository.createQueryBuilder().leftJoinAndSelect,
      ).toHaveBeenCalledWith('d.caCert', 'c');
      expect(
        databaseRepository.createQueryBuilder().where,
      ).toHaveBeenCalledWith({ caCert: mockId });
      expect(
        databaseRepository.createQueryBuilder().select,
      ).toHaveBeenCalledWith(['d.id']);
      expect(repository.delete).toHaveBeenCalledWith(mockId);
    });

    it('should throw NotFoundException when trying to delete non-existing ca certificate', async () => {
      const mockId = 'non-existent-id';

      // Mock findOneBy to return null (certificate not found)
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.delete(mockId)).rejects.toThrow(NotFoundException);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: mockId });
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });

  describe('cleanupPreSetup', () => {
    it('should delete ca certificates with isPreSetup flag enabled', async () => {
      const excludeIds = ['_1', '_2'];

      repository
        .createQueryBuilder()
        .delete()
        .execute.mockResolvedValue({ raw: [], affected: 1 });

      const result = await service.cleanupPreSetup(excludeIds);

      expect(result).toEqual({ affected: 1 });
      expect(repository.createQueryBuilder().where).toHaveBeenCalledWith({
        isPreSetup: true,
        id: Not(In(excludeIds)),
      });
    });
  });
});
