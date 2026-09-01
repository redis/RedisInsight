import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { NotFoundException } from '@nestjs/common';
import { mockSessionMetadata } from 'src/__mocks__';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { PipelineDraftEntity } from '../entities/pipeline-draft.entity';
import { LocalPipelineDraftRepository } from './local.pipeline-draft.repository';
import {
  pipelineDraftEntityFactory,
  createPipelineDraftDtoFactory,
} from '../__tests__/pipeline-draft.factory';

const mockRdiInstanceId = faker.string.uuid();

const mockEncryptResult = {
  data: 'encrypted_data',
  encryption: 'KEYTAR',
};

const mockEncryptionServiceFactory = jest.fn(() => ({
  getAvailableEncryptionStrategies: jest.fn(),
  isEncryptionAvailable: jest.fn().mockResolvedValue(true),
  encrypt: jest.fn().mockResolvedValue(mockEncryptResult),
  decrypt: jest.fn().mockImplementation((data) => data),
  getEncryptionStrategy: jest.fn(),
}));

const mockRepository = () => ({
  save: jest.fn().mockImplementation((entity) => ({
    ...entity,
    id: entity.id || faker.string.uuid(),
  })),
  find: jest.fn(),
  findOneBy: jest.fn(),
  delete: jest.fn().mockResolvedValue({ affected: 1 }),
});

describe('LocalPipelineDraftRepository', () => {
  let repository: LocalPipelineDraftRepository;
  let typeormRepo: ReturnType<typeof mockRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalPipelineDraftRepository,
        {
          provide: getRepositoryToken(PipelineDraftEntity),
          useFactory: mockRepository,
        },
        {
          provide: EncryptionService,
          useFactory: mockEncryptionServiceFactory,
        },
      ],
    }).compile();

    repository = module.get(LocalPipelineDraftRepository);
    typeormRepo = module.get(getRepositoryToken(PipelineDraftEntity));
  });

  describe('create', () => {
    it('should create and return a pipeline draft', async () => {
      const dto = createPipelineDraftDtoFactory.build();

      const result = await repository.create(
        mockSessionMetadata,
        mockRdiInstanceId,
        dto,
      );

      expect(result).toBeDefined();
      expect(typeormRepo.save).toHaveBeenCalled();
    });

    it('should store the entity data column as a JSON string, not the raw object', () => {
      // DataAsJsonString() is what lets the entity persist `data` as text
      // while every layer above the entity (API model, DTOs, controllers)
      // works with a real object - verified directly here, independent of
      // encryption, since the encryption mock above doesn't round-trip data.
      const original = { foo: 'bar', nested: { a: 1 } };

      const entity = plainToInstance(PipelineDraftEntity, { data: original });
      expect(typeof entity.data).toBe('string');
      expect(entity.data).toBe(JSON.stringify(original));

      const plain = instanceToPlain(entity);
      expect(plain.data).toEqual(original);
    });
  });

  describe('list', () => {
    it('should return list of drafts for the rdi instance', async () => {
      const entities = pipelineDraftEntityFactory.buildList(2, {
        rdiInstanceId: mockRdiInstanceId,
      });
      typeormRepo.find.mockResolvedValueOnce(entities);

      const result = await repository.list(
        mockSessionMetadata,
        mockRdiInstanceId,
      );

      expect(result).toHaveLength(2);
      expect(typeormRepo.find).toHaveBeenCalledWith({
        where: { rdiInstanceId: mockRdiInstanceId },
        order: { createdAt: 'ASC' },
      });
    });

    it('should return empty list', async () => {
      typeormRepo.find.mockResolvedValueOnce([]);

      const result = await repository.list(
        mockSessionMetadata,
        mockRdiInstanceId,
      );

      expect(result).toEqual([]);
    });

    it('should exclude entities that fail to decrypt', async () => {
      const decryptionError = new Error('decryption failed');
      mockEncryptionServiceFactory.mockReturnValueOnce({
        getAvailableEncryptionStrategies: jest.fn(),
        isEncryptionAvailable: jest.fn().mockResolvedValue(true),
        encrypt: jest.fn().mockResolvedValue(mockEncryptResult),
        decrypt: jest.fn().mockRejectedValue(decryptionError),
        getEncryptionStrategy: jest.fn(),
      });

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          LocalPipelineDraftRepository,
          {
            provide: getRepositoryToken(PipelineDraftEntity),
            useFactory: mockRepository,
          },
          {
            provide: EncryptionService,
            useFactory: mockEncryptionServiceFactory,
          },
        ],
      }).compile();

      const failingRepository = module.get(LocalPipelineDraftRepository);
      const failingTypeormRepo = module.get(
        getRepositoryToken(PipelineDraftEntity),
      );
      const entity = pipelineDraftEntityFactory.build({
        rdiInstanceId: mockRdiInstanceId,
        encryption: 'KEYTAR',
      });
      failingTypeormRepo.find.mockResolvedValueOnce([entity]);

      const result = await failingRepository.list(
        mockSessionMetadata,
        mockRdiInstanceId,
      );

      expect(result).toEqual([]);
    });
  });

  describe('get', () => {
    it('should return a single draft', async () => {
      const entity = pipelineDraftEntityFactory.build({
        rdiInstanceId: mockRdiInstanceId,
      });
      typeormRepo.findOneBy.mockResolvedValueOnce(entity);

      const result = await repository.get(
        mockSessionMetadata,
        mockRdiInstanceId,
        entity.id,
      );

      expect(result).toBeDefined();
      expect(typeormRepo.findOneBy).toHaveBeenCalledWith({
        id: entity.id,
        rdiInstanceId: mockRdiInstanceId,
      });
    });

    it('should throw NotFoundException when draft not found', async () => {
      typeormRepo.findOneBy.mockResolvedValueOnce(null);

      await expect(
        repository.get(
          mockSessionMetadata,
          mockRdiInstanceId,
          faker.string.uuid(),
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an existing draft', async () => {
      const entity = pipelineDraftEntityFactory.build({
        rdiInstanceId: mockRdiInstanceId,
      });
      typeormRepo.findOneBy.mockResolvedValueOnce(entity);

      const result = await repository.update(
        mockSessionMetadata,
        mockRdiInstanceId,
        entity.id,
        { data: { updated: true } },
      );

      expect(result).toBeDefined();
      expect(typeormRepo.findOneBy).toHaveBeenCalledWith({
        id: entity.id,
        rdiInstanceId: mockRdiInstanceId,
      });
      expect(typeormRepo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when draft not found', async () => {
      typeormRepo.findOneBy.mockResolvedValueOnce(null);

      await expect(
        repository.update(
          mockSessionMetadata,
          mockRdiInstanceId,
          faker.string.uuid(),
          { data: {} },
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a draft', async () => {
      const entity = pipelineDraftEntityFactory.build({
        rdiInstanceId: mockRdiInstanceId,
      });
      typeormRepo.findOneBy.mockResolvedValueOnce(entity);

      await repository.delete(
        mockSessionMetadata,
        mockRdiInstanceId,
        entity.id,
      );

      expect(typeormRepo.findOneBy).toHaveBeenCalledWith({
        id: entity.id,
        rdiInstanceId: mockRdiInstanceId,
      });
      expect(typeormRepo.delete).toHaveBeenCalledWith({
        id: entity.id,
        rdiInstanceId: mockRdiInstanceId,
      });
    });

    it('should throw NotFoundException when draft not found', async () => {
      typeormRepo.findOneBy.mockResolvedValueOnce(null);

      await expect(
        repository.delete(
          mockSessionMetadata,
          mockRdiInstanceId,
          faker.string.uuid(),
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
