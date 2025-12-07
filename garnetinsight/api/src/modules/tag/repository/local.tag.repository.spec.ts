import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocalTagRepository } from './local.tag.repository';
import { TagEntity } from '../entities/tag.entity';
import { Tag } from '../models/tag';
import { classToClass } from 'src/utils';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { mockEncryptionService, MockType } from 'src/__mocks__';

const mockTagEntities = [
  { id: '1', key: 'key1', value: 'value1' },
  { id: '2', key: 'key2', value: 'value2' },
].map((tag) => Object.assign(new TagEntity(), tag));

describe('LocalTagRepository', () => {
  let repository: LocalTagRepository;
  let tagRepository: Repository<TagEntity>;
  let encryptionService: MockType<EncryptionService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalTagRepository,
        {
          provide: getRepositoryToken(TagEntity),
          useClass: Repository,
        },
        {
          provide: EncryptionService,
          useFactory: mockEncryptionService,
        },
      ],
    }).compile();

    repository = module.get<LocalTagRepository>(LocalTagRepository);
    tagRepository = module.get<Repository<TagEntity>>(
      getRepositoryToken(TagEntity),
    );
    encryptionService = await module.get(EncryptionService);

    encryptionService.encrypt.mockImplementation(async (data) => ({
      data,
      encryption: 'KEYTAR',
    }));
    encryptionService.decrypt.mockImplementation(async (data) => data);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('list', () => {
    it('should return a list of tags', async () => {
      jest.spyOn(tagRepository, 'find').mockResolvedValue(mockTagEntities);

      const result = await repository.list();
      expect(result).toEqual(
        mockTagEntities.map((entity) => classToClass(Tag, entity)),
      );
    });
  });

  describe('get', () => {
    it('should return a tag by id', async () => {
      jest
        .spyOn(tagRepository, 'findOneBy')
        .mockResolvedValue(mockTagEntities[0]);

      const result = await repository.get('1');
      expect(result).toEqual(classToClass(Tag, mockTagEntities[0]));
    });
  });

  describe('getByKeyValuePair', () => {
    it('should return a tag by key-value pair', async () => {
      jest
        .spyOn(tagRepository, 'findOneBy')
        .mockResolvedValue(mockTagEntities[0]);

      const result = await repository.getByKeyValuePair('key1', 'value1');
      expect(result).toEqual(classToClass(Tag, mockTagEntities[0]));
    });
  });

  describe('create', () => {
    it('should create a new tag', async () => {
      const tag = { id: '1', key: 'key1', value: 'value1' } as Tag;
      const tagEntity = classToClass(TagEntity, tag);
      jest.spyOn(tagRepository, 'save').mockResolvedValue(tagEntity);

      const result = await repository.create(tag);
      expect(result).toEqual(classToClass(Tag, tagEntity));
    });
  });

  describe('update', () => {
    it('should update a tag', async () => {
      const tag = { key: 'updatedKey', value: 'updatedValue' } as Partial<Tag>;
      const tagEntity = classToClass(TagEntity, tag);
      jest.spyOn(tagRepository, 'update').mockResolvedValue(undefined);

      await repository.update('1', tag);
      expect(tagRepository.update).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({ ...tagEntity, encryption: 'KEYTAR' }),
      );
    });
  });

  describe('delete', () => {
    it('should delete a tag', async () => {
      jest.spyOn(tagRepository, 'delete').mockResolvedValue(undefined);

      await repository.delete('1');
      expect(tagRepository.delete).toHaveBeenCalledWith('1');
    });
  });

  describe('getOrCreateByKeyValuePairs', () => {
    it('should return existing tags or create new ones', async () => {
      const keyValuePairs = [
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: 'value2' },
      ];
      const tags = mockTagEntities.map((entity) => classToClass(Tag, entity));
      jest
        .spyOn(repository, 'getByKeyValuePair')
        .mockImplementation(async (key, value) => {
          return tags.find((tag) => tag.key === key && tag.value === value);
        });
      jest
        .spyOn(repository, 'create')
        .mockImplementation(async (tag) => classToClass(Tag, tag));

      const result = await repository.getOrCreateByKeyValuePairs(keyValuePairs);
      expect(result).toEqual(tags);
    });
  });
});
