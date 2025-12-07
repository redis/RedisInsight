import { CreateTagDto, UpdateTagDto } from 'src/modules/tag/dto';
import { Tag } from 'src/modules/tag/models/tag';
import { TagRepository } from 'src/modules/tag/repository/tag.repository';

export const mockTags: Tag[] = [
  Object.assign(new Tag(), {
    id: '1',
    key: 'environment',
    value: 'production',
    createdAt: new Date('2025-03-05T08:54:53.322Z'),
    updatedAt: new Date('2025-03-05T08:54:53.322Z'),
  }),
  Object.assign(new Tag(), {
    id: '2',
    key: 'environment',
    value: 'staging',
    createdAt: new Date('2025-03-05T08:54:53.322Z'),
    updatedAt: new Date('2025-03-05T08:54:53.322Z'),
  }),
  Object.assign(new Tag(), {
    id: '3',
    key: 'size',
    value: 'large',
    createdAt: new Date('2025-03-05T08:54:53.322Z'),
    updatedAt: new Date('2025-03-05T08:54:53.322Z'),
  }),
  Object.assign(new Tag(), {
    id: '4',
    key: 'size',
    value: 'small',
    createdAt: new Date('2025-03-05T08:54:53.322Z'),
    updatedAt: new Date('2025-03-05T08:54:53.322Z'),
  }),
];

export const createTagDto: CreateTagDto = { key: 'key1', value: 'value1' };
export const updateTagDto: UpdateTagDto = {
  key: 'updatedKey',
  value: 'updatedValue',
};

export const mockTagsService = jest.fn(() => ({
  create: jest.fn().mockResolvedValue(mockTags[0]),
  list: jest.fn().mockResolvedValue(mockTags),
  get: jest.fn().mockResolvedValue(mockTags[0]),
  getByKeyValuePair: jest.fn().mockResolvedValue(mockTags[0]),
  getOrCreateByKeyValuePairs: jest
    .fn()
    .mockResolvedValue([mockTags[0], mockTags[1]]),
  update: jest.fn().mockResolvedValue(mockTags[0]),
  delete: jest.fn().mockResolvedValue(undefined),
  cleanupUnusedTags: jest.fn(),
}));

export const mockTagsRepository = jest.fn(
  () =>
    ({
      create: jest.fn().mockResolvedValue(mockTags[0]),
      list: jest.fn().mockResolvedValue(mockTags),
      get: jest.fn().mockResolvedValue(mockTags[0]),
      getByKeyValuePair: jest.fn().mockResolvedValue(mockTags[0]),
      update: jest.fn(),
      delete: jest.fn(),
      encryptTagEntities: jest.fn().mockImplementation(async (tags) => tags),
      decryptTagEntities: jest.fn().mockImplementation(async (tags) => tags),
      getOrCreateByKeyValuePairs: jest
        .fn()
        .mockImplementation(async (tags) => tags),
      cleanupUnusedTags: jest.fn(),
    }) as TagRepository,
);
