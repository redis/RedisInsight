import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';
import { NotFoundException } from '@nestjs/common';
import { mockSessionMetadata } from 'src/__mocks__';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { QueryLibraryEntity } from '../entities/query-library.entity';
import { LocalQueryLibraryRepository } from './local-query-library.repository';
import {
  queryLibraryEntityFactory,
  createQueryLibraryItemDtoFactory,
  seedQueryLibraryItemDtoFactory,
} from '../__tests__/query-library.factory';

const mockDatabaseId = faker.string.uuid();

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
  count: jest.fn().mockResolvedValue(0),
});

describe('LocalQueryLibraryRepository', () => {
  let repository: LocalQueryLibraryRepository;
  let typeormRepo: ReturnType<typeof mockRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalQueryLibraryRepository,
        {
          provide: getRepositoryToken(QueryLibraryEntity),
          useFactory: mockRepository,
        },
        {
          provide: EncryptionService,
          useFactory: mockEncryptionServiceFactory,
        },
      ],
    }).compile();

    repository = module.get(LocalQueryLibraryRepository);
    typeormRepo = module.get(getRepositoryToken(QueryLibraryEntity));
  });

  describe('create', () => {
    it('should create and return a query library item', async () => {
      const dto = createQueryLibraryItemDtoFactory.build();

      const result = await repository.create(
        mockSessionMetadata,
        mockDatabaseId,
        dto,
      );

      expect(result).toBeDefined();
      expect(typeormRepo.save).toHaveBeenCalled();
    });
  });

  describe('getList', () => {
    it('should return list of items with indexName filter', async () => {
      const entities = queryLibraryEntityFactory.buildList(2, {
        databaseId: mockDatabaseId,
        indexName: 'idx:bikes_vss',
      });
      typeormRepo.find.mockResolvedValueOnce(entities);

      const result = await repository.getList(
        mockSessionMetadata,
        mockDatabaseId,
        { indexName: 'idx:bikes_vss' },
      );

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(typeormRepo.find).toHaveBeenCalledWith({
        where: {
          databaseId: mockDatabaseId,
          indexName: 'idx:bikes_vss',
        },
        order: { createdAt: 'ASC' },
      });
    });

    it('should return list with only indexName filter', async () => {
      const indexName = `idx:${faker.word.noun()}_vss`;
      typeormRepo.find.mockResolvedValueOnce([]);

      await repository.getList(mockSessionMetadata, mockDatabaseId, {
        indexName,
      });

      expect(typeormRepo.find).toHaveBeenCalledWith({
        where: { databaseId: mockDatabaseId, indexName },
        order: { createdAt: 'ASC' },
      });
    });

    it('should filter results by search term on name', async () => {
      const indexName = `idx:${faker.word.noun()}_vss`;
      const matchingEntity = Object.assign(new QueryLibraryEntity(), {
        ...queryLibraryEntityFactory.build({
          databaseId: mockDatabaseId,
          indexName,
        }),
        name: 'Vector similarity search',
      });
      const nonMatchingEntity = Object.assign(new QueryLibraryEntity(), {
        ...queryLibraryEntityFactory.build({
          databaseId: mockDatabaseId,
          indexName,
        }),
        name: 'Count documents',
      });
      typeormRepo.find.mockResolvedValueOnce([
        matchingEntity,
        nonMatchingEntity,
      ]);

      const result = await repository.getList(
        mockSessionMetadata,
        mockDatabaseId,
        { indexName, search: 'similarity' },
      );

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Vector similarity search');
    });

    it('should return all items when search is not provided', async () => {
      const indexName = `idx:${faker.word.noun()}_vss`;
      const entities = queryLibraryEntityFactory
        .buildList(3, {
          databaseId: mockDatabaseId,
          indexName,
        })
        .map((e) => Object.assign(new QueryLibraryEntity(), e));
      typeormRepo.find.mockResolvedValueOnce(entities);

      const result = await repository.getList(
        mockSessionMetadata,
        mockDatabaseId,
        { indexName },
      );

      expect(result).toHaveLength(3);
    });
  });

  describe('getOne', () => {
    it('should return a single item', async () => {
      const entity = queryLibraryEntityFactory.build({
        databaseId: mockDatabaseId,
      });
      typeormRepo.findOneBy.mockResolvedValueOnce(entity);

      const result = await repository.getOne(
        mockSessionMetadata,
        mockDatabaseId,
        entity.id,
      );

      expect(result).toBeDefined();
      expect(typeormRepo.findOneBy).toHaveBeenCalledWith({
        id: entity.id,
        databaseId: mockDatabaseId,
      });
    });

    it('should throw NotFoundException when item not found', async () => {
      typeormRepo.findOneBy.mockResolvedValueOnce(null);

      await expect(
        repository.getOne(
          mockSessionMetadata,
          mockDatabaseId,
          faker.string.uuid(),
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an existing item', async () => {
      const entity = queryLibraryEntityFactory.build({
        databaseId: mockDatabaseId,
      });
      typeormRepo.findOneBy.mockResolvedValueOnce(entity);

      const updatedName = faker.lorem.words(2);
      const result = await repository.update(
        mockSessionMetadata,
        mockDatabaseId,
        entity.id,
        { name: updatedName },
      );

      expect(result).toBeDefined();
      expect(typeormRepo.findOneBy).toHaveBeenCalledWith({
        id: entity.id,
        databaseId: mockDatabaseId,
      });
      expect(typeormRepo.save).toHaveBeenCalled();
    });

    it('should re-encrypt all fields on partial update to maintain consistent encryption', async () => {
      const entity = queryLibraryEntityFactory.build({
        databaseId: mockDatabaseId,
        name: 'encrypted_name',
        query: 'encrypted_query',
        description: 'encrypted_description',
        encryption: 'KEYTAR',
      });
      typeormRepo.findOneBy.mockResolvedValueOnce(entity);

      await repository.update(mockSessionMetadata, mockDatabaseId, entity.id, {
        query: 'FT.SEARCH idx:bikes "*"',
      });

      const savedEntity = typeormRepo.save.mock.calls[0][0];
      expect(savedEntity.encryption).toBe(mockEncryptResult.encryption);
      expect(savedEntity.name).toBe(mockEncryptResult.data);
      expect(savedEntity.query).toBe(mockEncryptResult.data);
      expect(savedEntity.description).toBe(mockEncryptResult.data);
    });

    it('should throw NotFoundException when item not found', async () => {
      typeormRepo.findOneBy.mockResolvedValueOnce(null);

      await expect(
        repository.update(
          mockSessionMetadata,
          mockDatabaseId,
          faker.string.uuid(),
          { name: faker.lorem.words(2) },
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete an item', async () => {
      const entity = queryLibraryEntityFactory.build({
        databaseId: mockDatabaseId,
      });
      typeormRepo.findOneBy.mockResolvedValueOnce(entity);

      await repository.delete(mockSessionMetadata, mockDatabaseId, entity.id);

      expect(typeormRepo.findOneBy).toHaveBeenCalledWith({
        id: entity.id,
        databaseId: mockDatabaseId,
      });
      expect(typeormRepo.delete).toHaveBeenCalledWith({
        id: entity.id,
        databaseId: mockDatabaseId,
      });
    });

    it('should throw NotFoundException when item not found', async () => {
      typeormRepo.findOneBy.mockResolvedValueOnce(null);

      await expect(
        repository.delete(
          mockSessionMetadata,
          mockDatabaseId,
          faker.string.uuid(),
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteByIndex', () => {
    it('should delete all items for an index', async () => {
      const indexName = `idx:${faker.word.noun()}_vss`;

      await repository.deleteByIndex(
        mockSessionMetadata,
        mockDatabaseId,
        indexName,
      );

      expect(typeormRepo.delete).toHaveBeenCalledWith({
        databaseId: mockDatabaseId,
        indexName,
      });
    });
  });

  describe('createBulk', () => {
    it('should bulk create items', async () => {
      const dtos = seedQueryLibraryItemDtoFactory.buildList(3);

      const result = await repository.createBulk(
        mockSessionMetadata,
        mockDatabaseId,
        dtos,
      );

      expect(result).toHaveLength(3);
      expect(typeormRepo.save).toHaveBeenCalledTimes(3);
    });
  });
});
