import { Test, TestingModule } from '@nestjs/testing';
import {
  mockAppSettings,
  mockFeaturesConfig,
  mockFeaturesConfigDataComplex,
  mockFeaturesConfigJson,
  mockFeaturesConfigService,
  mockServerState,
  mockSessionMetadata,
  mockSettingsService,
  MockType,
} from 'src/__mocks__';
import { SettingsService } from 'src/modules/settings/settings.service';
import { FeaturesConfigService } from 'src/modules/feature/features-config.service';
import { FeatureFlagStrategy } from 'src/modules/feature/providers/feature-flag/strategies/feature.flag.strategy';
import { CommonFlagStrategy } from 'src/modules/feature/providers/feature-flag/strategies/common.flag.strategy';
import {
  FeatureConfigFilter,
  FeatureConfigFilterAnd,
  FeatureConfigFilterCondition,
} from 'src/modules/feature/model/features-config';
import { KnownFeatures } from 'src/modules/feature/constants';
import { DefaultFlagStrategy } from 'src/modules/feature/providers/feature-flag/strategies/default.flag.strategy';
import { knownFeatures } from 'src/modules/feature/constants/known-features';

describe('FeatureFlagStrategy', () => {
  let service: FeatureFlagStrategy;
  let settingsService: MockType<SettingsService>;
  let featuresConfigService: MockType<FeaturesConfigService>;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: SettingsService,
          useFactory: mockSettingsService,
        },
        {
          provide: FeaturesConfigService,
          useFactory: mockFeaturesConfigService,
        },
      ],
    }).compile();

    settingsService = module.get(SettingsService);
    featuresConfigService = module.get(FeaturesConfigService);
    service = new CommonFlagStrategy(
      featuresConfigService as unknown as FeaturesConfigService,
      settingsService as unknown as SettingsService,
    );

    settingsService.getAppSettings.mockResolvedValue(mockAppSettings);
  });

  describe('isInTargetRange', () => {
    const testCases = [
      [[], false], // disable for all
      [[[0, 100]], true],
      [[[0, 50]], true],
      [
        [
          [0, 1],
          [2, 3],
          [5, 10],
        ],
        true,
      ],
      [[[0, 1]], false],
      [[[5, -600]], false],
      [[[100, -600]], false],
      [[[0, 0]], false],
      [[[0, mockFeaturesConfig.controlNumber]], false],
      [[[0, mockFeaturesConfig.controlNumber + 0.01]], true],
    ];

    testCases.forEach((tc) => {
      it(`should return ${tc[1]} for range: [${tc[0]}]`, async () => {
        expect(
          await service['isInTargetRange'](
            mockSessionMetadata,
            tc[0] as number[][],
          ),
        ).toEqual(tc[1]);
      });
    });

    it('should return false in case of any error', async () => {
      featuresConfigService.getControlInfo.mockRejectedValueOnce(
        new Error('unable to get control info'),
      );

      expect(
        await service['isInTargetRange'](mockSessionMetadata, [[0, 100]]),
      ).toEqual(false);
    });
  });

  describe('getServerState', () => {
    it('should return server state', async () => {
      expect(await service['getServerState']()).toEqual(mockServerState);
    });
    it('should return nulls in case of any error', async () => {
      settingsService.getAppSettings.mockRejectedValueOnce(
        new Error('unable to get app settings'),
      );

      expect(await service['getServerState']()).toEqual({
        ...mockServerState,
        agreements: null,
        settings: null,
      });
    });
  });

  describe('filter', () => {
    it('should return when no filters defined', async () => {
      expect(await service['filter']([])).toEqual(true);
    });
    it('should return true for single filter by agreements (eq)', async () => {
      expect(
        await service['filter']([
          Object.assign(new FeatureConfigFilter(), {
            name: 'agreements.analytics',
            value: true,
            cond: FeatureConfigFilterCondition.Eq,
          }),
        ]),
      ).toEqual(true);
    });
    it('should return false for single filter by agreements (eq)', async () => {
      settingsService.getAppSettings.mockResolvedValue({
        ...mockAppSettings,
        agreements: {
          ...mockAppSettings.agreements,
          analytics: false,
        },
      });

      expect(
        await service['filter']([
          Object.assign(new FeatureConfigFilter(), {
            name: 'agreements.analytics',
            value: true,
            cond: FeatureConfigFilterCondition.Eq,
          }),
        ]),
      ).toEqual(false);
    });
    it('should return false for single filter by agreements (neq)', async () => {
      expect(
        await service['filter']([
          Object.assign(new FeatureConfigFilter(), {
            name: 'agreements.analytics',
            value: true,
            cond: FeatureConfigFilterCondition.Neq,
          }),
        ]),
      ).toEqual(false);
    });
    it('should return false for unsupported condition (unsupported)', async () => {
      expect(
        await service['filter']([
          Object.assign(new FeatureConfigFilter(), {
            name: 'agreements.analytics',
            value: true,
            cond: 'unsupported' as FeatureConfigFilterCondition,
          }),
        ]),
      ).toEqual(false);
    });
    it('should return false numeric settings (eq)', async () => {
      expect(
        await service['filter']([
          Object.assign(new FeatureConfigFilter(), {
            name: 'settings.scanThreshold',
            value: mockAppSettings.scanThreshold,
            cond: FeatureConfigFilterCondition.Eq,
          }),
        ]),
      ).toEqual(true);
    });
    it('should return false for numeric settings (gt)', async () => {
      expect(
        await service['filter']([
          Object.assign(new FeatureConfigFilter(), {
            name: 'settings.scanThreshold',
            value: mockAppSettings.scanThreshold,
            cond: FeatureConfigFilterCondition.Gt,
          }),
        ]),
      ).toEqual(false);
    });
    it('should return true for numeric settings (gt)', async () => {
      expect(
        await service['filter']([
          Object.assign(new FeatureConfigFilter(), {
            name: 'settings.scanThreshold',
            value: mockAppSettings.scanThreshold - 1,
            cond: FeatureConfigFilterCondition.Gt,
          }),
        ]),
      ).toEqual(true);
    });
    it('should return true numeric settings (gte)', async () => {
      expect(
        await service['filter']([
          Object.assign(new FeatureConfigFilter(), {
            name: 'settings.scanThreshold',
            value: mockAppSettings.scanThreshold,
            cond: FeatureConfigFilterCondition.Gte,
          }),
        ]),
      ).toEqual(true);
    });
    it('should return false for numeric settings (lt)', async () => {
      expect(
        await service['filter']([
          Object.assign(new FeatureConfigFilter(), {
            name: 'settings.scanThreshold',
            value: mockAppSettings.scanThreshold,
            cond: FeatureConfigFilterCondition.Lt,
          }),
        ]),
      ).toEqual(false);
    });
    it('should return true for numeric settings (lt)', async () => {
      expect(
        await service['filter']([
          Object.assign(new FeatureConfigFilter(), {
            name: 'settings.scanThreshold',
            value: mockAppSettings.scanThreshold + 1,
            cond: FeatureConfigFilterCondition.Lt,
          }),
        ]),
      ).toEqual(true);
    });
    it('should return true numeric settings (lte)', async () => {
      expect(
        await service['filter']([
          Object.assign(new FeatureConfigFilter(), {
            name: 'settings.scanThreshold',
            value: mockAppSettings.scanThreshold,
            cond: FeatureConfigFilterCondition.Lte,
          }),
        ]),
      ).toEqual(true);
    });

    it('should return false in case of an error', async () => {
      const spy = jest.spyOn(service as any, 'getServerState');
      spy.mockRejectedValueOnce(new Error('unable to get state'));

      expect(
        await service['filter']([
          Object.assign(new FeatureConfigFilter(), {
            name: 'agreements.analytics',
            value: true,
            cond: FeatureConfigFilterCondition.Eq,
          }),
        ]),
      ).toEqual(false);
    });
  });

  describe('filter (complex)', () => {
    it('should return true since 2nd "or" condition is true', async () => {
      settingsService.getAppSettings.mockResolvedValueOnce({
        ...mockAppSettings,
        agreements: { analytics: true },
      });

      expect(
        await service['filter'](
          mockFeaturesConfigDataComplex.features.get(
            KnownFeatures.InsightsRecommendations,
          ).filters,
        ),
      ).toEqual(true);
    });
    it('should return false since 2nd "or" condition is false due to "and" inside is false', async () => {
      settingsService.getAppSettings.mockResolvedValueOnce({
        ...mockAppSettings,
        agreements: { analytics: true },
        scanThreshold: mockAppSettings.scanThreshold + 1,
        batchSize: mockAppSettings.batchSize + 1,
      });

      expect(
        await service['filter'](
          mockFeaturesConfigDataComplex.features.get(
            KnownFeatures.InsightsRecommendations,
          ).filters,
        ),
      ).toEqual(false);
    });
    it('should return true since 2nd "or" condition is true due to "or" inside is true', async () => {
      settingsService.getAppSettings.mockResolvedValueOnce({
        ...mockAppSettings,
        agreements: { analytics: true },
        scanThreshold: mockAppSettings.scanThreshold + 1,
      });

      expect(
        await service['filter'](
          mockFeaturesConfigDataComplex.features.get(
            KnownFeatures.InsightsRecommendations,
          ).filters,
        ),
      ).toEqual(true);
    });
    it('should return false since all 2 or conditions are false', async () => {
      settingsService.getAppSettings.mockResolvedValueOnce({
        ...mockAppSettings,
        agreements: { analytics: false },
      });

      expect(
        await service['filter'](
          mockFeaturesConfigDataComplex.features.get(
            KnownFeatures.InsightsRecommendations,
          ).filters,
        ),
      ).toEqual(false);
    });
    it('should return true since 1st "or" condition is true', async () => {
      settingsService.getAppSettings.mockResolvedValueOnce({
        ...mockAppSettings,
        testValue: 'test',
        agreements: { analytics: false },
      });

      expect(
        await service['filter'](
          mockFeaturesConfigDataComplex.features.get(
            KnownFeatures.InsightsRecommendations,
          ).filters,
        ),
      ).toEqual(true);
    });
  });

  describe('checkFilter', () => {
    it('should return false in case of any error', async () => {
      const spy = jest.spyOn(service as any, 'checkAndFilters');
      spy.mockImplementationOnce(() => {
        throw new Error('some error on "and" filters');
      });
      expect(
        await service['checkFilter'](
          Object.assign(new FeatureConfigFilterAnd(), {}),
          {},
        ),
      ).toEqual(false);
    });
  });

  describe('checkAndFilters', () => {
    let checkFilterSpy;
    beforeEach(() => {
      checkFilterSpy = jest.spyOn(service as any, 'checkFilter');
    });

    it('should return true since all filters returned true', async () => {
      checkFilterSpy.mockReturnValueOnce(true);
      checkFilterSpy.mockReturnValueOnce(true);
      checkFilterSpy.mockReturnValueOnce(true);

      expect(
        await service['checkAndFilters'](
          new Array(3).fill(
            mockFeaturesConfigJson.features[
              KnownFeatures.InsightsRecommendations
            ].filters[0],
          ),
          {},
        ),
      ).toEqual(true);
    });

    it('should return false since at least one filter returned false', async () => {
      checkFilterSpy.mockReturnValueOnce(true);
      checkFilterSpy.mockReturnValueOnce(false);
      checkFilterSpy.mockReturnValueOnce(true);

      expect(
        await service['checkAndFilters'](
          new Array(3).fill(
            mockFeaturesConfigJson.features[
              KnownFeatures.InsightsRecommendations
            ].filters[0],
          ),
          {},
        ),
      ).toEqual(false);
    });

    it('should return false due to error', async () => {
      checkFilterSpy.mockImplementation(() => {
        throw new Error('error when check filters');
      });

      expect(
        await service['checkAndFilters'](
          new Array(3).fill(
            mockFeaturesConfigJson.features[
              KnownFeatures.InsightsRecommendations
            ].filters[0],
          ),
          {},
        ),
      ).toEqual(false);
    });
  });

  describe('checkOrFilters', () => {
    let checkFilterSpy;
    beforeEach(() => {
      checkFilterSpy = jest.spyOn(service as any, 'checkFilter');
    });

    it('should return true since at least one filter returned true', async () => {
      checkFilterSpy.mockReturnValueOnce(false);
      checkFilterSpy.mockReturnValueOnce(true);
      checkFilterSpy.mockReturnValueOnce(false);

      expect(
        await service['checkOrFilters'](
          new Array(3).fill(
            mockFeaturesConfigJson.features[
              KnownFeatures.InsightsRecommendations
            ].filters[0],
          ),
          {},
        ),
      ).toEqual(true);
    });

    it('should return false since all filters returned false', async () => {
      checkFilterSpy.mockReturnValueOnce(false);
      checkFilterSpy.mockReturnValueOnce(false);
      checkFilterSpy.mockReturnValueOnce(false);

      expect(
        await service['checkOrFilters'](
          new Array(3).fill(
            mockFeaturesConfigJson.features[
              KnownFeatures.InsightsRecommendations
            ].filters[0],
          ),
          {},
        ),
      ).toEqual(false);
    });

    it('should return false due to error', async () => {
      checkFilterSpy.mockImplementation(() => {
        throw new Error('error when check filters');
      });

      expect(
        await service['checkOrFilters'](
          new Array(3).fill(
            mockFeaturesConfigJson.features[
              KnownFeatures.InsightsRecommendations
            ].filters[0],
          ),
          {},
        ),
      ).toEqual(false);
    });
  });

  describe('calculate', () => {
    let isInTargetRangeSpy;
    let filterSpy;

    beforeEach(() => {
      isInTargetRangeSpy = jest.spyOn(service as any, 'isInTargetRange');
      filterSpy = jest.spyOn(service as any, 'filter');
    });

    it('should return false since feature control number is out of range', async () => {
      isInTargetRangeSpy.mockReturnValueOnce(false);

      expect(
        await service.calculate(
          mockSessionMetadata,
          knownFeatures[KnownFeatures.InsightsRecommendations],
          mockFeaturesConfigJson.features[
            KnownFeatures.InsightsRecommendations
          ],
        ),
      ).toEqual({
        name: KnownFeatures.InsightsRecommendations,
        flag: false,
      });

      expect(isInTargetRangeSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockFeaturesConfigJson.features[KnownFeatures.InsightsRecommendations]
          .perc,
      );
      expect(filterSpy).not.toHaveBeenCalled();
    });

    it('should return false since feature filters does not match', async () => {
      isInTargetRangeSpy.mockReturnValueOnce(true);
      filterSpy.mockReturnValueOnce(false);

      expect(
        await service.calculate(
          mockSessionMetadata,
          knownFeatures[KnownFeatures.InsightsRecommendations],
          mockFeaturesConfigJson.features[
            KnownFeatures.InsightsRecommendations
          ],
        ),
      ).toEqual({
        name: KnownFeatures.InsightsRecommendations,
        flag: false,
      });

      expect(isInTargetRangeSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockFeaturesConfigJson.features[KnownFeatures.InsightsRecommendations]
          .perc,
      );
      expect(filterSpy).toHaveBeenCalledWith(
        mockFeaturesConfigJson.features[KnownFeatures.InsightsRecommendations]
          .filters,
      );
    });
    it('should return true since all checks passes', async () => {
      isInTargetRangeSpy.mockReturnValueOnce(true);
      filterSpy.mockReturnValueOnce(true);

      expect(
        await service.calculate(
          mockSessionMetadata,
          knownFeatures[KnownFeatures.InsightsRecommendations],
          mockFeaturesConfigJson.features[
            KnownFeatures.InsightsRecommendations
          ],
        ),
      ).toEqual({
        name: KnownFeatures.InsightsRecommendations,
        flag: true,
      });

      expect(isInTargetRangeSpy).toHaveBeenCalledWith(
        mockSessionMetadata,
        mockFeaturesConfigJson.features[KnownFeatures.InsightsRecommendations]
          .perc,
      );
      expect(filterSpy).toHaveBeenCalledWith(
        mockFeaturesConfigJson.features[KnownFeatures.InsightsRecommendations]
          .filters,
      );
    });
  });

  describe('DefaultFlagStrategy', () => {
    it('should always return false', async () => {
      const strategy = new DefaultFlagStrategy(
        featuresConfigService as unknown as FeaturesConfigService,
        settingsService as unknown as SettingsService,
      );

      expect(
        await strategy.calculate(
          mockSessionMetadata,
          knownFeatures[KnownFeatures.InsightsRecommendations],
        ),
      ).toEqual({
        name: KnownFeatures.InsightsRecommendations,
        flag: false,
      });
    });
  });
});
