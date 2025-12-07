import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import {
  mockConstantsProvider,
  mockControlGroup,
  mockControlNumber,
  mockFeature,
  mockFeatureAnalytics,
  mockFeatureFlagProvider,
  mockFeatureRepository,
  mockFeatureDatabaseManagement,
  mockFeaturesConfig,
  mockFeaturesConfigJson,
  mockFeaturesConfigRepository,
  mockFeaturesConfigService,
  mockFeatureSso,
  mockSessionMetadata,
  MockType,
  mockUnknownFeature,
} from 'src/__mocks__';
import { FeaturesConfigRepository } from 'src/modules/feature/repositories/features-config.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { KnownFeatures } from 'src/modules/feature/constants';
import { FeatureAnalytics } from 'src/modules/feature/feature.analytics';
import { LocalFeatureService } from 'src/modules/feature/local.feature.service';
import { FeatureRepository } from 'src/modules/feature/repositories/feature.repository';
import { FeatureFlagProvider } from 'src/modules/feature/providers/feature-flag/feature-flag.provider';
import * as fs from 'fs-extra';
import { FeaturesConfigService } from 'src/modules/feature/features-config.service';
import { ConstantsProvider } from 'src/modules/constants/providers/constants.provider';

jest.mock('fs-extra');
const mockedFs = fs as jest.Mocked<typeof fs>;

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('FeatureService', () => {
  let service: LocalFeatureService;
  let repository: MockType<FeatureRepository>;
  let configsRepository: MockType<FeaturesConfigRepository>;
  let featureRepository: MockType<FeatureRepository>;
  let analytics: MockType<FeatureAnalytics>;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.mock('fs-extra', () => mockedFs);
    mockedFs.readFile.mockResolvedValueOnce(
      JSON.stringify({
        features: {
          [KnownFeatures.CloudSso]: false,
        },
      }) as any,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalFeatureService,
        {
          provide: EventEmitter2,
          useFactory: () => ({
            emit: jest.fn(),
          }),
        },
        {
          provide: FeaturesConfigRepository,
          useFactory: mockFeaturesConfigRepository,
        },
        {
          provide: FeatureRepository,
          useFactory: mockFeatureRepository,
        },
        {
          provide: FeatureAnalytics,
          useFactory: mockFeatureAnalytics,
        },
        {
          provide: FeatureFlagProvider,
          useFactory: mockFeatureFlagProvider,
        },
        {
          provide: FeaturesConfigService,
          useFactory: mockFeaturesConfigService,
        },
        {
          provide: ConstantsProvider,
          useFactory: mockConstantsProvider,
        },
      ],
    }).compile();

    service = module.get(LocalFeatureService);
    repository = module.get(FeatureRepository);
    configsRepository = module.get(FeaturesConfigRepository);
    featureRepository = module.get(FeatureRepository);
    analytics = module.get(FeatureAnalytics);

    mockedAxios.get.mockResolvedValue({ data: mockFeaturesConfigJson });
  });

  describe('getByName', () => {
    it('should return feature when exists', async () => {
      expect(
        await service.getByName(
          mockSessionMetadata,
          KnownFeatures.InsightsRecommendations,
        ),
      ).toEqual(mockFeature);
      expect(featureRepository.get).toHaveBeenCalledWith(
        mockSessionMetadata,
        KnownFeatures.InsightsRecommendations,
      );
    });
    it('should return feature with "custom" storage', async () => {
      expect(
        await service.getByName(
          mockSessionMetadata,
          KnownFeatures.DatabaseManagement,
        ),
      ).toEqual(mockFeatureDatabaseManagement);
      expect(featureRepository.get).not.toHaveBeenCalledWith();
    });
    it('should return null for unsupported storage type (undefined in current test)', async () => {
      expect(
        await service.getByName(mockSessionMetadata, 'unknown feature'),
      ).toEqual(null);
      expect(featureRepository.get).not.toHaveBeenCalledWith();
    });
    it("should return null when feature doesn't exists", async () => {
      featureRepository.get.mockResolvedValueOnce(null);
      expect(
        await service.getByName(
          mockSessionMetadata,
          KnownFeatures.InsightsRecommendations,
        ),
      ).toEqual(null);
    });
    it('should return null in case of an error', async () => {
      featureRepository.get.mockRejectedValueOnce(
        new Error('Unable to fetch flag from db'),
      );
      expect(
        await service.getByName(
          mockSessionMetadata,
          KnownFeatures.InsightsRecommendations,
        ),
      ).toEqual(null);
    });
  });

  describe('isFeatureEnabled', () => {
    it('should return true when in db: true', async () => {
      expect(
        await service.isFeatureEnabled(
          mockSessionMetadata,
          KnownFeatures.InsightsRecommendations,
        ),
      ).toEqual(true);
      expect(featureRepository.get).toHaveBeenCalledWith(
        mockSessionMetadata,
        KnownFeatures.InsightsRecommendations,
      );
    });
    it('should return false when in db: false', async () => {
      repository.get.mockResolvedValue({ flag: false });
      expect(
        await service.isFeatureEnabled(
          mockSessionMetadata,
          KnownFeatures.InsightsRecommendations,
        ),
      ).toEqual(false);
    });
    it('should return true for custom storage', async () => {
      expect(
        await service.isFeatureEnabled(
          mockSessionMetadata,
          KnownFeatures.DatabaseManagement,
        ),
      ).toEqual(true);
      expect(featureRepository.get).not.toHaveBeenCalledWith();
    });
    it('should return false for unsupported storage type (undefined in current test)', async () => {
      expect(
        await service.isFeatureEnabled(mockSessionMetadata, 'unknown feature'),
      ).toEqual(false);
      expect(featureRepository.get).not.toHaveBeenCalledWith();
    });
    it('should return false in case of an error', async () => {
      repository.get.mockRejectedValueOnce(
        new Error('Unable to fetch flag from db'),
      );
      expect(
        await service.isFeatureEnabled(
          mockSessionMetadata,
          KnownFeatures.InsightsRecommendations,
        ),
      ).toEqual(false);
    });
  });

  describe('list', () => {
    it('should return list of features flags', async () => {
      expect(await service.list(mockSessionMetadata)).toEqual({
        controlGroup: mockControlGroup,
        controlNumber: mockControlNumber,
        features: {
          [KnownFeatures.InsightsRecommendations]: mockFeature,
          [KnownFeatures.CloudSso]: mockFeatureSso,
          [KnownFeatures.DatabaseManagement]: mockFeatureDatabaseManagement,
        },
      });
    });
  });

  describe('recalculateFeatureFlags', () => {
    it('should recalculate flags (1 update an 1 delete)', async () => {
      repository.list.mockResolvedValueOnce([
        mockFeature,
        mockFeatureSso,
        mockUnknownFeature,
      ]);
      repository.list.mockResolvedValueOnce([mockFeature, mockFeatureSso]);
      configsRepository.getOrCreate.mockResolvedValueOnce(mockFeaturesConfig);

      await service.recalculateFeatureFlags();

      expect(repository.delete).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockUnknownFeature.name,
      );
      expect(repository.upsert).toHaveBeenCalledWith(mockSessionMetadata, {
        name: KnownFeatures.InsightsRecommendations,
        flag: mockFeaturesConfig.data.features.get(
          KnownFeatures.InsightsRecommendations,
        ).flag,
      });
      expect(analytics.sendFeatureFlagRecalculated).toHaveBeenCalledWith(
        mockSessionMetadata,
        {
          configVersion: mockFeaturesConfig.data.version,
          features: {
            [KnownFeatures.InsightsRecommendations]: mockFeature,
            [KnownFeatures.CloudSso]: mockFeatureSso,
            [KnownFeatures.DatabaseManagement]: mockFeatureDatabaseManagement,
          },
          force: {
            [KnownFeatures.CloudSso]: false,
          },
        },
      );
    });
    it('should not fail in case of an error', async () => {
      repository.list.mockRejectedValueOnce(new Error());

      await service.recalculateFeatureFlags();

      expect(repository.delete).not.toHaveBeenCalled();
      expect(repository.upsert).not.toHaveBeenCalled();
    });
  });
});
