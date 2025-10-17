import { http, HttpHandler, HttpResponse } from 'msw'
import { ApiEndpoints } from 'uiSrc/constants'
import { getMswURL } from 'uiSrc/utils/test-utils'

export const FEATURES_DATA_MOCK = {
  features: {
    insightsRecommendations: {
      name: 'insightsRecommendations',
      flag: true,
    },
    envDependent: {
      name: 'envDependent',
      flag: true,
    },
    cloudSso: {
      name: 'cloudSso',
      flag: true,
      strategy: 'deepLink',
      data: {
        filterFreePlan: [
          {
            field: 'name',
            expression: '^(No HA?.)|(Cache?.)|(30MB$)',
            options: 'i',
          },
        ],
        selectPlan: {
          components: {
            triggersAndFunctions: [
              {
                provider: 'AWS',
                regions: ['ap-southeast-1'],
              },
              {
                provider: 'GCP',
                regions: ['asia-northeast1'],
              },
            ],
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
    },
    cloudSsoRecommendedSettings: {
      name: 'cloudSsoRecommendedSettings',
      flag: false,
    },
    redisModuleFilter: {
      name: 'redisModuleFilter',
      flag: true,
      data: {
        hideByName: [
          {
            expression: '^RedisGraph.',
            options: 'i',
          },
          {
            expression: '^RedisStackCompat?.',
            options: 'i',
          },
          {
            expression: '^rediscompat?.',
            options: 'i',
          },
        ],
      },
    },
    redisClient: {
      name: 'redisClient',
      flag: true,
      data: {
        strategy: 'ioredis',
      },
    },
    documentationChat: {
      name: 'documentationChat',
      flag: true,
    },
    databaseChat: {
      name: 'databaseChat',
      flag: true,
    },
  },
}

const handlers: HttpHandler[] = [
  // get features
  http.get<any, (typeof FEATURES_DATA_MOCK)[]>(
    getMswURL(ApiEndpoints.FEATURES),
    async () => {
      return HttpResponse.json(FEATURES_DATA_MOCK, { status: 200 })
    },
  ),
]

export default handlers
