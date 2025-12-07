import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  mockFeature,
  mockFeatureEntity,
  mockRepository,
  mockSessionMetadata,
  MockType,
} from 'src/__mocks__';
import { LocalFeatureRepository } from 'src/modules/feature/repositories/local.feature.repository';
import { FeatureEntity } from 'src/modules/feature/entities/feature.entity';

describe('LocalFeatureRepository', () => {
  let service: LocalFeatureRepository;
  let repository: MockType<Repository<FeatureEntity>>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalFeatureRepository,
        {
          provide: getRepositoryToken(FeatureEntity),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    repository = await module.get(getRepositoryToken(FeatureEntity));
    service = await module.get(LocalFeatureRepository);

    repository.findOneBy.mockResolvedValue(mockFeatureEntity);
    repository.find.mockResolvedValue([
      mockFeatureEntity,
      mockFeatureEntity,
      mockFeatureEntity,
    ]);
    repository.upsert.mockResolvedValue({ updated: 1, inserted: 0 });
    repository.delete.mockResolvedValue({ deleted: 1 });
  });

  describe('get', () => {
    it('should return feature by name', async () => {
      const result = await service.get(mockSessionMetadata, mockFeature.name);

      expect(result).toEqual(mockFeature);
    });
    it('should return null when entity not found', async () => {
      repository.findOneBy.mockResolvedValueOnce(null);

      const result = await service.get(mockSessionMetadata, mockFeature.name);

      expect(result).toEqual(null);
    });
  });

  describe('list', () => {
    it('should return features', async () => {
      const result = await service.list();

      expect(result).toEqual([mockFeature, mockFeature, mockFeature]);
    });
    it('should return empty list', async () => {
      repository.find.mockResolvedValueOnce([]);

      const result = await service.list();

      expect(result).toEqual([]);
    });
  });

  describe('upsert', () => {
    it('should update or insert and return model', async () => {
      const result = await service.upsert(mockSessionMetadata, mockFeature);

      expect(result).toEqual(mockFeature);
    });
  });

  describe('delete', () => {
    it('should delete and do not return anything', async () => {
      const result = await service.delete(
        mockSessionMetadata,
        mockFeature.name,
      );

      expect(result).toEqual(undefined);
    });
  });
});
