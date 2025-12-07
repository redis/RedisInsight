import { pick } from 'lodash';
import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import {
  mockClientCertificate,
  mockClientCertificateRepository,
  mockCreateClientCertificateDto,
  MockType,
  mockRedisClientStorage,
} from 'src/__mocks__';
import { KeytarEncryptionErrorException } from 'src/modules/encryption/exceptions';
import { ClientCertificateService } from 'src/modules/certificate/client-certificate.service';
import { ClientCertificateRepository } from 'src/modules/certificate/repositories/client-certificate.repository';
import { RedisClientStorage } from 'src/modules/redis/redis.client.storage';

describe('ClientCertificateService', () => {
  let service: ClientCertificateService;
  let repository: MockType<ClientCertificateRepository>;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientCertificateService,
        {
          provide: ClientCertificateRepository,
          useFactory: mockClientCertificateRepository,
        },
        {
          provide: RedisClientStorage,
          useFactory: mockRedisClientStorage,
        },
      ],
    }).compile();

    service = await module.get(ClientCertificateService);
    repository = await module.get(ClientCertificateRepository);
  });

  describe('get', () => {
    it('should return client certificate model', async () => {
      expect(await service.get(mockClientCertificate.id)).toEqual(
        mockClientCertificate,
      );
    });
    it('should return NotFound error if no certificated found', async () => {
      repository.get.mockResolvedValueOnce(null);

      try {
        await service.get(mockClientCertificate.id);
        fail();
      } catch (e) {
        // why BadRequest instead of NotFound?
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toEqual(ERROR_MESSAGES.INVALID_CERTIFICATE_ID);
      }
    });
  });

  describe('list', () => {
    it('get all certificates from the repository', async () => {
      const result = await service.list();

      expect(result).toEqual([
        pick(mockClientCertificate, 'id', 'name'),
        pick(mockClientCertificate, 'id', 'name'),
      ]);
    });
  });

  describe('create', () => {
    it('should return client certificate model', async () => {
      expect(await service.create(mockCreateClientCertificateDto)).toEqual(
        mockClientCertificate,
      );
    });
    it('should throw encryption error', async () => {
      repository.create.mockRejectedValueOnce(
        new KeytarEncryptionErrorException(),
      );

      try {
        await service.create(mockCreateClientCertificateDto);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(KeytarEncryptionErrorException);
      }
    });
    it('should throw 500 error in any other case (why?)', async () => {
      repository.create.mockRejectedValueOnce(new BadRequestException());

      try {
        await service.create(mockCreateClientCertificateDto);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
      }
    });
  });

  describe('delete', () => {
    const mockId = 'mock-client-cert-id';
    const mockAffectedDatabases = ['db1', 'db2'];

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should delete client certificate and remove affected database clients', async () => {
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affectedDatabases: mockAffectedDatabases });
      jest
        .spyOn(service['redisClientStorage'], 'removeManyByMetadata')
        .mockResolvedValue(undefined);

      await service.delete(mockId);

      expect(repository.delete).toHaveBeenCalledWith(mockId);
      expect(
        service['redisClientStorage'].removeManyByMetadata,
      ).toHaveBeenCalledTimes(mockAffectedDatabases.length);
      mockAffectedDatabases.forEach((databaseId) => {
        expect(
          service['redisClientStorage'].removeManyByMetadata,
        ).toHaveBeenCalledWith({ databaseId });
      });
    });

    it('should throw encryption error', async () => {
      repository.delete.mockRejectedValueOnce(
        new KeytarEncryptionErrorException(),
      );

      try {
        await service.delete(mockClientCertificate.id);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(KeytarEncryptionErrorException);
      }
    });
    it('should throw 500 error in any other case (why?)', async () => {
      repository.delete.mockRejectedValueOnce(new Error());

      try {
        await service.delete(mockClientCertificate.id);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
      }
    });
  });
});
