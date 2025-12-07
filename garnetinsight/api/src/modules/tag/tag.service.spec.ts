import { Test, TestingModule } from '@nestjs/testing';
import { TagService } from './tag.service';
import { TagRepository } from './repository/tag.repository';
import { Tag } from './models/tag';
import { NotFoundException, ConflictException } from '@nestjs/common';
import {
  mockTags,
  createTagDto,
  mockTagsRepository,
  updateTagDto,
} from 'src/__mocks__';

describe('TagService', () => {
  let service: TagService;
  let repository: TagRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagService,
        {
          provide: TagRepository,
          useFactory: mockTagsRepository,
        },
      ],
    }).compile();

    service = module.get<TagService>(TagService);
    repository = module.get<TagRepository>(TagRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new tag', async () => {
      const tag: Tag = {
        ...mockTags[0],
        ...createTagDto,
      };
      jest.spyOn(repository, 'create').mockResolvedValue(tag);

      const result = await service.create(createTagDto);
      expect(result).toEqual(tag);
      expect(repository.create).toHaveBeenCalledWith(expect.any(Tag));
    });

    it('should throw ConflictException if tag already exists', async () => {
      jest.spyOn(repository, 'create').mockRejectedValue({ code: '2067' });

      await expect(service.create(createTagDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('list', () => {
    it('should return a list of tags', async () => {
      jest.spyOn(repository, 'list').mockResolvedValue(mockTags);

      const result = await service.list();
      expect(result).toEqual(mockTags);
    });
  });

  describe('get', () => {
    it('should return a tag by id', async () => {
      const tag: Tag = mockTags[0];
      jest.spyOn(repository, 'get').mockResolvedValue(tag);

      const result = await service.get('1');
      expect(result).toEqual(tag);
    });

    it('should throw NotFoundException if tag not found', async () => {
      jest.spyOn(repository, 'get').mockResolvedValue(null);

      await expect(service.get('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getByKeyValuePair', () => {
    it('should return a tag by key-value pair', async () => {
      const tag: Tag = mockTags[0];
      jest.spyOn(repository, 'getByKeyValuePair').mockResolvedValue(tag);

      const result = await service.getByKeyValuePair(tag.key, tag.value);
      expect(result).toEqual(tag);
    });

    it('should throw NotFoundException if tag not found', async () => {
      jest.spyOn(repository, 'getByKeyValuePair').mockResolvedValue(null);

      await expect(service.getByKeyValuePair('key1', 'value1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getOrCreateByKeyValuePairs', () => {
    it('should return existing tags or create new ones', async () => {
      const keyValuePairs = [
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: 'value2' },
      ];
      const tags = [mockTags[0], mockTags[1]];
      jest
        .spyOn(repository, 'getOrCreateByKeyValuePairs')
        .mockResolvedValue(tags);

      const result = await service.getOrCreateByKeyValuePairs(keyValuePairs);
      expect(result).toEqual(tags);
    });
  });

  describe('update', () => {
    it('should update a tag', async () => {
      const tag: Tag = {
        id: '1',
        ...updateTagDto,
        createdAt: new Date(),
        updatedAt: new Date(),
        databases: [],
      } as Tag;
      jest.spyOn(repository, 'update').mockResolvedValue(undefined);
      jest.spyOn(repository, 'get').mockResolvedValue(tag);

      const result = await service.update('1', updateTagDto);
      expect(result).toEqual(tag);
      expect(repository.update).toHaveBeenCalledWith('1', updateTagDto);
    });
  });

  describe('delete', () => {
    it('should delete a tag', async () => {
      await service.delete('1');
      expect(repository.delete).toHaveBeenCalledWith('1');
    });
  });
});
