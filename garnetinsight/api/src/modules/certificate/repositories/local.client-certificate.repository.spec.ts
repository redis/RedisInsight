import { when } from 'jest-when';
import { pick } from 'lodash';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import {
  mockClientCertificate,
  mockClientCertificateCertificateEncrypted,
  mockClientCertificateCertificatePlain,
  mockClientCertificateEntity,
  mockClientCertificateId,
  mockClientCertificateKeyEncrypted,
  mockClientCertificateKeyPlain,
  mockEncryptionService,
  mockRepository,
  MockType,
} from 'src/__mocks__';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { LocalClientCertificateRepository } from 'src/modules/certificate/repositories/local.client-certificate.repository';
import { ClientCertificateEntity } from 'src/modules/certificate/entities/client-certificate.entity';
import { DatabaseEntity } from 'src/modules/database/entities/database.entity';

describe('LocalClientCertificateRepository', () => {
  let service: LocalClientCertificateRepository;
  let encryptionService: MockType<EncryptionService>;
  let repository: MockType<Repository<ClientCertificateEntity>>;
  let databaseRepository: MockType<Repository<DatabaseEntity>>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalClientCertificateRepository,
        {
          provide: getRepositoryToken(ClientCertificateEntity),
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

    repository = await module.get(getRepositoryToken(ClientCertificateEntity));
    databaseRepository = await module.get(getRepositoryToken(DatabaseEntity));
    encryptionService = await module.get(EncryptionService);
    service = await module.get(LocalClientCertificateRepository);

    repository.findOneBy.mockResolvedValue(mockClientCertificateEntity);
    repository
      .createQueryBuilder()
      .getMany.mockResolvedValue([
        pick(mockClientCertificateEntity, 'id', 'name'),
        pick(mockClientCertificateEntity, 'id', 'name'),
      ]);
    repository.save.mockResolvedValue(mockClientCertificateEntity);
    repository.create.mockReturnValue(mockClientCertificate); // not an entity since create happens before encryption

    when(encryptionService.decrypt)
      .calledWith(mockClientCertificateCertificateEncrypted, expect.anything())
      .mockResolvedValue(mockClientCertificateCertificatePlain)
      .calledWith(mockClientCertificateKeyEncrypted, expect.anything())
      .mockResolvedValue(mockClientCertificateKeyPlain);
    when(encryptionService.encrypt)
      .calledWith(mockClientCertificateCertificatePlain)
      .mockResolvedValue({
        data: mockClientCertificateCertificateEncrypted,
        encryption: mockClientCertificateEntity.encryption,
      })
      .calledWith(mockClientCertificateKeyPlain)
      .mockResolvedValue({
        data: mockClientCertificateKeyEncrypted,
        encryption: mockClientCertificateEntity.encryption,
      });
  });

  describe('get', () => {
    it('should return client certificate model', async () => {
      const result = await service.get(mockClientCertificateId);

      expect(result).toEqual(mockClientCertificate);
    });
  });

  describe('list', () => {
    it('should return client certificates list', async () => {
      const result = await service.list();

      expect(result).toEqual([
        pick(mockClientCertificate, 'id', 'name'),
        pick(mockClientCertificate, 'id', 'name'),
      ]);
    });
  });

  describe('create', () => {
    it('should create client certificate', async () => {
      repository.findOneBy.mockResolvedValueOnce(null);

      const result = await service.create(mockClientCertificate);

      expect(result).toEqual(mockClientCertificate);
    });

    it('should throw an error when client certificate with such name already exists', async () => {
      try {
        await service.create(mockClientCertificate);
        fail();
      } catch (e) {
        // todo: why not ConflictException?
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual(ERROR_MESSAGES.CLIENT_CERT_EXIST);
        expect(repository.save).not.toHaveBeenCalled();
      }
    });

    it('should ignore unique check when explicitly disabled via flag', async () => {
      const result = await service.create(mockClientCertificate, false);

      expect(result).toEqual(mockClientCertificate);
    });
  });

  describe('delete', () => {
    const mockId = 'mock-client-cert-id';
    const mockAffectedDatabases = ['db1', 'db2'];

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should delete client certificate and return affected databases', async () => {
      jest
        .spyOn(repository, 'findOneBy')
        .mockResolvedValue(mockClientCertificate);

      databaseRepository
        .createQueryBuilder()
        .getMany.mockResolvedValue(mockAffectedDatabases.map((id) => ({ id })));

      jest.spyOn(repository, 'delete').mockResolvedValue(undefined);

      const result = await service.delete(mockId);

      expect(result).toEqual({ affectedDatabases: mockAffectedDatabases });
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: mockId });
      expect(
        service['databaseRepository'].createQueryBuilder,
      ).toHaveBeenCalledWith('d');
      expect(
        databaseRepository.createQueryBuilder().leftJoinAndSelect,
      ).toHaveBeenCalledWith('d.clientCert', 'c');
      expect(
        databaseRepository.createQueryBuilder().where,
      ).toHaveBeenCalledWith({ clientCert: mockId });
      expect(
        databaseRepository.createQueryBuilder().select,
      ).toHaveBeenCalledWith(['d.id']);
      expect(repository.delete).toHaveBeenCalledWith(mockId);
    });

    it('should throw NotFoundException when trying to delete non-existing client certificate', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      await expect(service.delete(mockId)).rejects.toThrow(NotFoundException);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: mockId });
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });

  describe('cleanupPreSetup', () => {
    it('should delete certificates with isPreSetup flag enabled', async () => {
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
