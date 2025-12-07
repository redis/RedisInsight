import { Test, TestingModule } from '@nestjs/testing';
import {
  mockFeature,
  mockFeaturesConfig,
  mockFeaturesConfigService,
  mockInsightsRecommendationsFlagStrategy,
  mockSessionMetadata,
  mockSettingsService,
} from 'src/__mocks__';
import { FeaturesConfigService } from 'src/modules/feature/features-config.service';
import { FeatureFlagProvider } from 'src/modules/feature/providers/feature-flag/feature-flag.provider';
import { SettingsService } from 'src/modules/settings/settings.service';
import { KnownFeatures } from 'src/modules/feature/constants';
import { CommonFlagStrategy } from 'src/modules/feature/providers/feature-flag/strategies/common.flag.strategy';
import { DefaultFlagStrategy } from 'src/modules/feature/providers/feature-flag/strategies/default.flag.strategy';
import { knownFeatures } from 'src/modules/feature/constants/known-features';

describe('FeatureFlagProvider', () => {
  let service: FeatureFlagProvider;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeatureFlagProvider,
        {
          provide: FeaturesConfigService,
          useFactory: mockFeaturesConfigService,
        },
        {
          provide: SettingsService,
          useFactory: mockSettingsService,
        },
      ],
    }).compile();

    service = module.get(FeatureFlagProvider);
  });

  describe('getStrategy', () => {
    it('should return common strategy', async () => {
      expect(
        await service.getStrategy(KnownFeatures.InsightsRecommendations),
      ).toBeInstanceOf(CommonFlagStrategy);
    });
    it('should return common strategy', async () => {
      expect(
        await service.getStrategy(KnownFeatures.CloudSsoRecommendedSettings),
      ).toBeInstanceOf(CommonFlagStrategy);
    });
    it('should return default strategy when directly called', async () => {
      expect(await service.getStrategy('default')).toBeInstanceOf(
        DefaultFlagStrategy,
      );
    });
    it('should return default strategy when when no strategy found', async () => {
      expect(
        await service.getStrategy('some not existing strategy'),
      ).toBeInstanceOf(DefaultFlagStrategy);
    });
  });

  describe('calculate', () => {
    it('should calculate ', async () => {
      jest
        .spyOn(service, 'getStrategy')
        .mockReturnValue(
          mockInsightsRecommendationsFlagStrategy as unknown as CommonFlagStrategy,
        );

      expect(
        await service.calculate(
          mockSessionMetadata,
          knownFeatures[KnownFeatures.InsightsRecommendations],
          mockFeaturesConfig[KnownFeatures.InsightsRecommendations],
        ),
      ).toEqual(mockFeature);
      expect(
        mockInsightsRecommendationsFlagStrategy.calculate,
      ).toHaveBeenCalledWith(
        mockSessionMetadata,
        knownFeatures[KnownFeatures.InsightsRecommendations],
        mockFeaturesConfig[KnownFeatures.InsightsRecommendations],
      );
    });
  });
});
