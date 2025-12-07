import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import {
  mockCaCertificate,
  mockCaCertificateRepository,
  mockCreateCaCertificateDto,
  MockType,
  mockRedisClientStorage,
} from 'src/__mocks__';
import { CaCertificateRepository } from 'src/modules/certificate/repositories/ca-certificate.repository';
import { RedisClientStorage } from 'src/modules/redis/redis.client.storage';
import { pick } from 'lodash';
import { KeytarEncryptionErrorException } from 'src/modules/encryption/exceptions';
import { CaCertificateService } from './ca-certificate.service';

describe('CaCertificateService', () => {
  let service: CaCertificateService;
  let repository: MockType<CaCertificateRepository>;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CaCertificateService,
        {
          provide: CaCertificateRepository,
          useFactory: mockCaCertificateRepository,
        },
        {
          provide: RedisClientStorage,
          useFactory: mockRedisClientStorage,
        },
      ],
    }).compile();

    service = await module.get(CaCertificateService);
    repository = await module.get(CaCertificateRepository);
  });

  describe('get', () => {
    it('should return ca certificate model', async () => {
      expect(await service.get(mockCaCertificate.id)).toEqual(
        mockCaCertificate,
      );
    });
    it('should return NotFound error if no certificated found', async () => {
      repository.get.mockResolvedValueOnce(null);

      try {
        await service.get(mockCaCertificate.id);
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
        pick(mockCaCertificate, 'id', 'name'),
        pick(mockCaCertificate, 'id', 'name'),
      ]);
    });
  });

  describe('create', () => {
    it('should return ca certificate model', async () => {
      expect(await service.create(mockCreateCaCertificateDto)).toEqual(
        mockCaCertificate,
      );
    });
    it('should throw encryption error', async () => {
      repository.create.mockRejectedValueOnce(
        new KeytarEncryptionErrorException(),
      );

      try {
        await service.create(mockCreateCaCertificateDto);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(KeytarEncryptionErrorException);
      }
    });
    it('should throw 500 error in any other case (why?)', async () => {
      repository.create.mockRejectedValueOnce(new BadRequestException());

      try {
        await service.create(mockCreateCaCertificateDto);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
      }
    });
  });

  describe('delete', () => {
    const mockId = 'mock-ca-cert-id';
    const mockAffectedDatabases = ['db1', 'db2'];

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should delete CA certificate and remove affected database clients', async () => {
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
        await service.delete(mockCaCertificate.id);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(KeytarEncryptionErrorException);
      }
    });
    it('should throw 500 error in any other case (why?)', async () => {
      repository.delete.mockRejectedValueOnce(new Error());

      try {
        await service.delete(mockCaCertificate.id);
        fail();
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
      }
    });
  });
});
