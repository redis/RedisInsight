import { FeaturesConfigEntity } from 'src/modules/feature/entities/features-config.entity';
import {
  FeatureConfig,
  FeatureConfigFilter,
  FeatureConfigFilterAnd,
  FeatureConfigFilterOr,
  FeaturesConfig,
  FeaturesConfigData,
} from 'src/modules/feature/model/features-config';
import { classToClass } from 'src/utils';
import { Feature } from 'src/modules/feature/model/feature';
import { FeatureEntity } from 'src/modules/feature/entities/feature.entity';
import { mockAppSettings } from 'src/__mocks__/app-settings';
import config from 'src/utils/config';
import { KnownFeatures } from 'src/modules/feature/constants';
import { CloudSsoFeatureStrategy } from 'src/modules/cloud/cloud-sso.feature.flag';
import * as defaultConfig from '../../config/features-config.json';

export const mockFeaturesConfigId = '1';
export const mockFeaturesConfigVersion = defaultConfig.version + 0.111;
export const mockControlNumber = 7.68;
export const mockControlGroup = '7';
export const mockAppVersion = '2.1.0';

export const mockFeaturesConfigJson = {
  version: mockFeaturesConfigVersion,
  features: {
    [KnownFeatures.InsightsRecommendations]: {
      perc: [[1.25, 8.45]],
      flag: true,
      filters: [
        {
          name: 'agreements.analytics',
          value: true,
          cond: 'eq',
        },
      ],
    },
  },
};

export const mockFeaturesConfigJsonComplex = {
  ...mockFeaturesConfigJson,
  features: {
    [KnownFeatures.InsightsRecommendations]: {
      ...mockFeaturesConfigJson.features[KnownFeatures.InsightsRecommendations],
      filters: [
        {
          or: [
            {
              name: 'settings.testValue',
              value: 'test',
              cond: 'eq',
            },
            {
              and: [
                {
                  name: 'agreements.analytics',
                  value: true,
                  cond: 'eq',
                },
                {
                  or: [
                    {
                      name: 'settings.scanThreshold',
                      value: mockAppSettings.scanThreshold,
                      cond: 'eq',
                    },
                    {
                      name: 'settings.batchSize',
                      value: mockAppSettings.batchSize,
                      cond: 'eq',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  },
};

export const mockFeaturesConfigData = Object.assign(new FeaturesConfigData(), {
  ...mockFeaturesConfigJson,
  features: new Map(
    Object.entries({
      [KnownFeatures.InsightsRecommendations]: Object.assign(
        new FeatureConfig(),
        {
          ...mockFeaturesConfigJson.features[
            KnownFeatures.InsightsRecommendations
          ],
          filters: [
            Object.assign(new FeatureConfigFilter(), {
              ...mockFeaturesConfigJson.features[
                KnownFeatures.InsightsRecommendations
              ].filters[0],
            }),
          ],
        },
      ),
    }),
  ),
});

export const mockFeaturesConfigDataComplex = Object.assign(
  new FeaturesConfigData(),
  {
    ...mockFeaturesConfigJson,
    features: new Map(
      Object.entries({
        [KnownFeatures.InsightsRecommendations]: Object.assign(
          new FeatureConfig(),
          {
            ...mockFeaturesConfigJson.features[
              KnownFeatures.InsightsRecommendations
            ],
            filters: [
              Object.assign(new FeatureConfigFilterOr(), {
                or: [
                  Object.assign(new FeatureConfigFilter(), {
                    name: 'settings.testValue',
                    value: 'test',
                    cond: 'eq',
                  }),
                  Object.assign(new FeatureConfigFilterAnd(), {
                    and: [
                      Object.assign(new FeatureConfigFilter(), {
                        name: 'agreements.analytics',
                        value: true,
                        cond: 'eq',
                      }),
                      Object.assign(new FeatureConfigFilterOr(), {
                        or: [
                          Object.assign(new FeatureConfigFilter(), {
                            name: 'settings.scanThreshold',
                            value: mockAppSettings.scanThreshold,
                            cond: 'eq',
                          }),
                          Object.assign(new FeatureConfigFilter(), {
                            name: 'settings.batchSize',
                            value: mockAppSettings.batchSize,
                            cond: 'eq',
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          },
        ),
      }),
    ),
  },
);

export const mockFeaturesConfig = Object.assign(new FeaturesConfig(), {
  controlNumber: mockControlNumber,
  data: mockFeaturesConfigData,
});

export const mockFeaturesConfigComplex = Object.assign(new FeaturesConfig(), {
  controlNumber: mockControlNumber,
  data: mockFeaturesConfigDataComplex,
});

export const mockFeaturesConfigEntity = Object.assign(
  new FeaturesConfigEntity(),
  {
    ...classToClass(FeaturesConfigEntity, mockFeaturesConfig),
    id: mockFeaturesConfigId,
  },
);

export const mockFeaturesConfigEntityComplex = Object.assign(
  new FeaturesConfigEntity(),
  {
    ...classToClass(FeaturesConfigEntity, mockFeaturesConfigComplex),
    id: mockFeaturesConfigId,
  },
);

export const mockFeature = Object.assign(new Feature(), {
  name: KnownFeatures.InsightsRecommendations,
  flag: true,
});

export const mockFeatureSso = Object.assign(new Feature(), {
  name: KnownFeatures.CloudSso,
  flag: true,
  strategy: CloudSsoFeatureStrategy.DeepLink,
  data: {
    selectPlan: {
      components: {
        redisStackPreview: [
          {
            provider: 'AWS',
            regions: ['us-east-2', 'ap-southeast-1', 'sa-east-1'],
          },
          {
            provider: 'GCP',
            regions: ['asia-northeast1', 'europe-west1', 'us-central1'],
          },
        ],
      },
    },
  },
});

export const mockFeatureDatabaseManagement = Object.assign(new Feature(), {
  name: KnownFeatures.DatabaseManagement,
  flag: true,
});

export const mockFeatureRedisClient = Object.assign(new Feature(), {
  name: KnownFeatures.RedisClient,
  flag: true,
  data: {
    strategy: 'ioredis',
  },
});

export const mockUnknownFeature = Object.assign(new Feature(), {
  name: 'unknown',
  flag: true,
});

export const mockFeatureEntity = Object.assign(new FeatureEntity(), {
  id: 'lr-1',
  name: KnownFeatures.InsightsRecommendations,
  flag: true,
});

export const mockServerState = {
  settings: mockAppSettings,
  agreements: mockAppSettings.agreements,
  config: config.get(),
  env: process.env,
};

export const mockFeaturesConfigRepository = jest.fn(() => ({
  getOrCreate: jest.fn().mockResolvedValue(mockFeaturesConfig),
  update: jest.fn().mockResolvedValue(mockFeaturesConfig),
}));

export const mockFeatureRepository = jest.fn(() => ({
  get: jest.fn().mockResolvedValue(mockFeature),
  upsert: jest.fn().mockResolvedValue({ updated: 1 }),
  list: jest.fn().mockResolvedValue([mockFeature, mockFeatureSso]),
  delete: jest.fn().mockResolvedValue({ deleted: 1 }),
}));

export const mockFeaturesConfigService = jest.fn(() => ({
  sync: jest.fn(),
  getControlInfo: jest.fn().mockResolvedValue({
    controlNumber: mockControlNumber,
    controlGroup: mockControlGroup,
  }),
}));

export const mockFeatureService = jest.fn(() => ({
  getByName: jest.fn().mockResolvedValue(undefined),
  isFeatureEnabled: jest.fn().mockResolvedValue(true),
}));

export const mockFeatureAnalytics = jest.fn(() => ({
  sendFeatureFlagConfigUpdated: jest.fn(),
  sendFeatureFlagConfigUpdateError: jest.fn(),
  sendFeatureFlagInvalidRemoteConfig: jest.fn(),
  sendFeatureFlagRecalculated: jest.fn(),
}));

export const mockInsightsRecommendationsFlagStrategy = {
  calculate: jest.fn().mockResolvedValue(mockFeature),
};

export const mockFeatureFlagProvider = jest.fn(() => ({
  getStrategy: jest
    .fn()
    .mockResolvedValue(mockInsightsRecommendationsFlagStrategy),
  calculate: jest.fn().mockResolvedValue(mockFeature),
}));
