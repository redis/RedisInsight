import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  mockCustomTutorial,
  mockCustomTutorialEntity,
  mockCustomTutorialId,
  mockRepository,
  MockType,
} from 'src/__mocks__';
import { LocalCustomTutorialRepository } from 'src/modules/custom-tutorial/repositories/local.custom-tutorial.repository';
import { CustomTutorialEntity } from 'src/modules/custom-tutorial/entities/custom-tutorial.entity';

describe('LocalCustomTutorialRepository', () => {
  let service: LocalCustomTutorialRepository;
  let repository: MockType<Repository<CustomTutorialEntity>>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalCustomTutorialRepository,
        {
          provide: getRepositoryToken(CustomTutorialEntity),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    repository = await module.get(getRepositoryToken(CustomTutorialEntity));
    service = await module.get(LocalCustomTutorialRepository);

    repository.findOneBy.mockResolvedValue(mockCustomTutorialEntity);
    repository
      .createQueryBuilder()
      .getMany.mockResolvedValue([
        mockCustomTutorialEntity,
        mockCustomTutorialEntity,
      ]);
    repository.save.mockResolvedValue(mockCustomTutorialEntity);
  });

  describe('get', () => {
    it('should return custom tutorial model', async () => {
      const result = await service.get(mockCustomTutorialId);

      expect(result).toEqual(mockCustomTutorial);
    });

    it('should return null when custom tutorial was not found', async () => {
      repository.findOneBy.mockResolvedValue(undefined);

      const result = await service.get(mockCustomTutorialId);

      expect(result).toEqual(undefined);
    });
  });

  describe('list', () => {
    it('should return list of custom tutorials', async () => {
      expect(await service.list()).toEqual([
        mockCustomTutorial,
        mockCustomTutorial,
      ]);
    });
  });

  describe('create', () => {
    it('should create custom tutorial', async () => {
      const result = await service.create(mockCustomTutorial);

      expect(result).toEqual(mockCustomTutorial);
      expect(repository.save).toHaveBeenCalledWith({
        ...mockCustomTutorialEntity,
        createdAt: expect.anything(),
      });
    });
  });

  describe('delete', () => {
    it('should delete custom tutorial by id', async () => {
      expect(await service.delete(mockCustomTutorialId)).toEqual(undefined);
    });
  });
});
