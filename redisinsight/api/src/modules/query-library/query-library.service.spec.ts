import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { mockSessionMetadata } from 'src/__mocks__';
import { QueryLibraryService } from './query-library.service';
import { QueryLibraryRepository } from './repositories/query-library.repository';
import { QueryLibraryType } from './models/query-library-type.enum';
import {
  queryLibraryItemFactory,
  createQueryLibraryItemDtoFactory,
  seedQueryLibraryItemDtoFactory,
} from './__tests__/query-library.factory';

const mockDatabaseId = faker.string.uuid();

const mockQueryLibraryRepository = () => ({
  create: jest.fn(),
  getList: jest.fn(),
  getOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  deleteByIndex: jest.fn(),
  createBulk: jest.fn(),
  countByIndex: jest.fn(),
});

describe('QueryLibraryService', () => {
  let service: QueryLibraryService;
  let repository: ReturnType<typeof mockQueryLibraryRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueryLibraryService,
        {
          provide: QueryLibraryRepository,
          useFactory: mockQueryLibraryRepository,
        },
      ],
    }).compile();

    service = module.get(QueryLibraryService);
    repository = module.get(QueryLibraryRepository);
  });

  describe('create', () => {
    it('should create a query library item with type SAVED', async () => {
      const item = queryLibraryItemFactory.build({
        databaseId: mockDatabaseId,
        type: QueryLibraryType.Saved,
      });
      const dto = createQueryLibraryItemDtoFactory.build({
        indexName: item.indexName,
        name: item.name,
        query: item.query,
      });
      repository.create.mockResolvedValueOnce(item);

      const result = await service.create(
        mockSessionMetadata,
        mockDatabaseId,
        dto,
      );

      expect(result).toEqual(item);
      expect(repository.create).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockDatabaseId,
        expect.objectContaining({
          indexName: dto.indexName,
          type: QueryLibraryType.Saved,
        }),
      );
    });

    it('should throw on repository error', async () => {
      const dto = createQueryLibraryItemDtoFactory.build();
      repository.create.mockRejectedValueOnce(
        new InternalServerErrorException(),
      );

      await expect(
        service.create(mockSessionMetadata, mockDatabaseId, dto),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getList', () => {
    it('should return list of items', async () => {
      const items = queryLibraryItemFactory.buildList(3, {
        databaseId: mockDatabaseId,
        indexName: 'idx:bikes_vss',
      });
      repository.getList.mockResolvedValueOnce(items);

      const result = await service.getList(
        mockSessionMetadata,
        mockDatabaseId,
        { indexName: 'idx:bikes_vss' },
      );

      expect(result).toEqual(items);
    });

    it('should return empty list', async () => {
      repository.getList.mockResolvedValueOnce([]);

      const result = await service.getList(
        mockSessionMetadata,
        mockDatabaseId,
        {},
      );

      expect(result).toEqual([]);
    });
  });

  describe('getOne', () => {
    it('should return a single item', async () => {
      const item = queryLibraryItemFactory.build({
        databaseId: mockDatabaseId,
      });
      repository.getOne.mockResolvedValueOnce(item);

      const result = await service.getOne(
        mockSessionMetadata,
        mockDatabaseId,
        item.id,
      );

      expect(result).toEqual(item);
    });

    it('should throw NotFoundException if item not found', async () => {
      repository.getOne.mockRejectedValueOnce(new NotFoundException());

      await expect(
        service.getOne(
          mockSessionMetadata,
          mockDatabaseId,
          faker.string.uuid(),
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a query library item', async () => {
      const item = queryLibraryItemFactory.build({
        databaseId: mockDatabaseId,
      });
      const updatedName = faker.lorem.words(2);
      const updatedItem = { ...item, name: updatedName };
      repository.update.mockResolvedValueOnce(updatedItem);

      const result = await service.update(
        mockSessionMetadata,
        mockDatabaseId,
        item.id,
        { name: updatedName },
      );

      expect(result).toEqual(updatedItem);
    });

    it('should throw NotFoundException if item not found', async () => {
      repository.update.mockRejectedValueOnce(new NotFoundException());

      await expect(
        service.update(
          mockSessionMetadata,
          mockDatabaseId,
          faker.string.uuid(),
          { name: faker.lorem.words(2) },
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a query library item', async () => {
      const item = queryLibraryItemFactory.build({
        databaseId: mockDatabaseId,
      });
      repository.delete.mockResolvedValueOnce(undefined);

      await service.delete(mockSessionMetadata, mockDatabaseId, item.id);

      expect(repository.delete).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockDatabaseId,
        item.id,
      );
    });

    it('should throw NotFoundException if item not found', async () => {
      repository.delete.mockRejectedValueOnce(new NotFoundException());

      await expect(
        service.delete(
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
      repository.deleteByIndex.mockResolvedValueOnce(undefined);

      await service.deleteByIndex(
        mockSessionMetadata,
        mockDatabaseId,
        indexName,
      );

      expect(repository.deleteByIndex).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockDatabaseId,
        indexName,
      );
    });
  });

  describe('seed', () => {
    it('should seed sample queries when none exist', async () => {
      const indexName = 'idx:bikes_vss';
      const seedItems = seedQueryLibraryItemDtoFactory.buildList(2, {
        indexName,
      });
      const createdItems = queryLibraryItemFactory.buildList(2, {
        databaseId: mockDatabaseId,
        indexName,
        type: QueryLibraryType.Sample,
      });

      repository.getList.mockResolvedValueOnce([]);
      repository.createBulk.mockResolvedValueOnce(createdItems);

      const result = await service.seed(mockSessionMetadata, mockDatabaseId, {
        items: seedItems,
      });

      expect(result).toHaveLength(2);
      expect(repository.getList).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockDatabaseId,
        { indexName },
      );
      expect(repository.createBulk).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockDatabaseId,
        seedItems.map((item) => ({
          ...item,
          type: QueryLibraryType.Sample,
        })),
      );
    });

    it('should only seed items that do not already exist by name', async () => {
      const indexName = 'idx:bikes_vss';
      const existingSample = queryLibraryItemFactory.build({
        databaseId: mockDatabaseId,
        indexName,
        type: QueryLibraryType.Sample,
        name: 'Existing Query',
      });
      const seedItems = [
        seedQueryLibraryItemDtoFactory.build({
          indexName,
          name: 'Existing Query',
        }),
        seedQueryLibraryItemDtoFactory.build({
          indexName,
          name: 'New Query',
        }),
      ];
      const createdItem = queryLibraryItemFactory.build({
        databaseId: mockDatabaseId,
        indexName,
        type: QueryLibraryType.Sample,
        name: 'New Query',
      });

      repository.getList.mockResolvedValueOnce([existingSample]);
      repository.createBulk.mockResolvedValueOnce([createdItem]);

      const result = await service.seed(mockSessionMetadata, mockDatabaseId, {
        items: seedItems,
      });

      expect(result).toHaveLength(2);
      expect(result).toEqual([existingSample, createdItem]);
      expect(repository.createBulk).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockDatabaseId,
        [
          expect.objectContaining({
            name: 'New Query',
            type: QueryLibraryType.Sample,
          }),
        ],
      );
    });

    it('should skip seeding when all sample queries already exist', async () => {
      const indexName = 'idx:bikes_vss';
      const existingItems = [
        queryLibraryItemFactory.build({
          databaseId: mockDatabaseId,
          indexName,
          type: QueryLibraryType.Sample,
          name: 'Query A',
        }),
        queryLibraryItemFactory.build({
          databaseId: mockDatabaseId,
          indexName,
          type: QueryLibraryType.Sample,
          name: 'Query B',
        }),
      ];
      const seedItems = [
        seedQueryLibraryItemDtoFactory.build({ indexName, name: 'Query A' }),
        seedQueryLibraryItemDtoFactory.build({ indexName, name: 'Query B' }),
      ];

      repository.getList.mockResolvedValueOnce(existingItems);

      const result = await service.seed(mockSessionMetadata, mockDatabaseId, {
        items: seedItems,
      });

      expect(result).toEqual(existingItems);
      expect(repository.createBulk).not.toHaveBeenCalled();
    });

    it('should return empty array for empty items', async () => {
      const result = await service.seed(mockSessionMetadata, mockDatabaseId, {
        items: [],
      });

      expect(result).toEqual([]);
      expect(repository.getList).not.toHaveBeenCalled();
    });
  });
});
