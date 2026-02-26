import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { mockSessionMetadata } from 'src/__mocks__';
import { QueryLibraryController } from './query-library.controller';
import { QueryLibraryService } from './query-library.service';
import { QueryLibraryType } from './models/query-library-type.enum';
import {
  queryLibraryItemFactory,
  createQueryLibraryItemDtoFactory,
  seedQueryLibraryItemDtoFactory,
} from './__tests__/query-library.factory';

const mockDatabaseId = faker.string.uuid();

const mockClientMetadata = {
  sessionMetadata: mockSessionMetadata,
  databaseId: mockDatabaseId,
};

const mockQueryLibraryService = () => ({
  create: jest.fn(),
  getList: jest.fn(),
  getOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  seed: jest.fn(),
});

describe('QueryLibraryController', () => {
  let controller: QueryLibraryController;
  let service: ReturnType<typeof mockQueryLibraryService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QueryLibraryController],
      providers: [
        {
          provide: QueryLibraryService,
          useFactory: mockQueryLibraryService,
        },
      ],
    }).compile();

    controller = module.get(QueryLibraryController);
    service = module.get(QueryLibraryService);
  });

  describe('create', () => {
    it('should create a query library item', async () => {
      const item = queryLibraryItemFactory.build({
        databaseId: mockDatabaseId,
      });
      const dto = createQueryLibraryItemDtoFactory.build({
        indexName: item.indexName,
        name: item.name,
        query: item.query,
      });
      service.create.mockResolvedValueOnce(item);

      const result = await controller.create(mockClientMetadata as any, dto);

      expect(result).toEqual(item);
      expect(service.create).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockDatabaseId,
        expect.objectContaining({ indexName: dto.indexName }),
      );
    });
  });

  describe('list', () => {
    it('should return list of items', async () => {
      const items = queryLibraryItemFactory.buildList(3, {
        databaseId: mockDatabaseId,
        indexName: 'idx:bikes_vss',
      });
      service.getList.mockResolvedValueOnce(items);

      const result = await controller.list(mockClientMetadata as any, {
        indexName: 'idx:bikes_vss',
      });

      expect(result).toEqual(items);
      expect(service.getList).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockDatabaseId,
        { indexName: 'idx:bikes_vss' },
      );
    });
  });

  describe('getOne', () => {
    it('should return a single item', async () => {
      const item = queryLibraryItemFactory.build({
        databaseId: mockDatabaseId,
      });
      service.getOne.mockResolvedValueOnce(item);

      const result = await controller.getOne(
        mockClientMetadata as any,
        item.id,
      );

      expect(result).toEqual(item);
    });
  });

  describe('update', () => {
    it('should update a query library item', async () => {
      const item = queryLibraryItemFactory.build({
        databaseId: mockDatabaseId,
      });
      const updatedName = faker.lorem.words(2);
      const updatedItem = { ...item, name: updatedName };
      service.update.mockResolvedValueOnce(updatedItem);

      const result = await controller.update(
        mockClientMetadata as any,
        item.id,
        { name: updatedName },
      );

      expect(result).toEqual(updatedItem);
    });
  });

  describe('delete', () => {
    it('should delete a query library item', async () => {
      const item = queryLibraryItemFactory.build({
        databaseId: mockDatabaseId,
      });
      service.delete.mockResolvedValueOnce(undefined);

      await controller.delete(mockClientMetadata as any, item.id);

      expect(service.delete).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockDatabaseId,
        item.id,
      );
    });

    it('should throw NotFoundException when item not found', async () => {
      service.delete.mockRejectedValueOnce(new NotFoundException());

      await expect(
        controller.delete(mockClientMetadata as any, faker.string.uuid()),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('seed', () => {
    it('should seed sample queries', async () => {
      const items = queryLibraryItemFactory.buildList(2, {
        databaseId: mockDatabaseId,
        type: QueryLibraryType.Sample,
      });
      const dto = {
        items: seedQueryLibraryItemDtoFactory.buildList(2),
      };
      service.seed.mockResolvedValueOnce(items);

      const result = await controller.seed(mockClientMetadata as any, dto);

      expect(result).toEqual(items);
    });

    it('should throw on service error', async () => {
      const dto = {
        items: seedQueryLibraryItemDtoFactory.buildList(1),
      };
      service.seed.mockRejectedValueOnce(new InternalServerErrorException());

      await expect(
        controller.seed(mockClientMetadata as any, dto),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
