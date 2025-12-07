import { Test, TestingModule } from '@nestjs/testing';
import { get } from 'lodash';
import { resetAllWhenMocks } from 'jest-when';
import {
  mockCommonClientMetadata,
  mockDatabase,
  mockDatabaseAnalytics,
  mockDatabaseInfoProvider,
  mockDatabaseRepository,
  mockDatabaseService,
  mockDatabaseRecommendationService,
  MockType,
  mockRedisGeneralInfo,
  mockRedisClientListResult,
  mockDatabaseClientFactory,
  mockFeatureService,
  mockSessionMetadata,
} from 'src/__mocks__';
import { DatabaseAnalytics } from 'src/modules/database/database.analytics';
import { DatabaseService } from 'src/modules/database/database.service';
import { DatabaseRecommendationService } from 'src/modules/database-recommendation/database-recommendation.service';
import { DatabaseRepository } from 'src/modules/database/repositories/database.repository';
import { DatabaseInfoProvider } from 'src/modules/database/providers/database-info.provider';
import { DatabaseConnectionService } from 'src/modules/database/database-connection.service';
import { RECOMMENDATION_NAMES } from 'src/constants';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import { FeatureService } from 'src/modules/feature/feature.service';
import { getHostingProvider } from 'src/utils/hosting-provider-helper';
import { HostingProvider } from 'src/modules/database/entities/database.entity';

jest.mock('src/utils/hosting-provider-helper');

describe('DatabaseConnectionService', () => {
  let service: DatabaseConnectionService;
  let analytics: MockType<DatabaseAnalytics>;
  let recommendationService: MockType<DatabaseRecommendationService>;
  let databaseInfoProvider: MockType<DatabaseInfoProvider>;
  let featureService: MockType<FeatureService>;
  let repository: MockType<DatabaseRepository>;

  beforeEach(async () => {
    jest.clearAllMocks();
    resetAllWhenMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseConnectionService,
        {
          provide: DatabaseRepository,
          useFactory: mockDatabaseRepository,
        },
        {
          provide: DatabaseClientFactory,
          useFactory: mockDatabaseClientFactory,
        },
        {
          provide: DatabaseInfoProvider,
          useFactory: mockDatabaseInfoProvider,
        },
        {
          provide: DatabaseService,
          useFactory: mockDatabaseService,
        },
        {
          provide: DatabaseAnalytics,
          useFactory: mockDatabaseAnalytics,
        },
        {
          provide: DatabaseRecommendationService,
          useFactory: mockDatabaseRecommendationService,
        },
        {
          provide: FeatureService,
          useFactory: mockFeatureService,
        },
      ],
    }).compile();

    service = await module.get(DatabaseConnectionService);
    analytics = await module.get(DatabaseAnalytics);
    recommendationService = module.get(DatabaseRecommendationService);
    databaseInfoProvider = module.get(DatabaseInfoProvider);
    featureService = module.get(FeatureService);
    repository = module.get(DatabaseRepository);

    featureService.getByName.mockResolvedValue({
      flag: false,
    });
  });

  describe('connect', () => {
    it('should connect to database', async () => {
      expect(await service.connect(mockCommonClientMetadata)).toEqual(
        undefined,
      );
    });

    it('should call recommendationService', async () => {
      expect(await service.connect(mockCommonClientMetadata)).toEqual(
        undefined,
      );

      expect(recommendationService.checkMulti).toHaveBeenCalledTimes(1);

      expect(recommendationService.checkMulti).toBeCalledWith(
        mockCommonClientMetadata,
        [
          RECOMMENDATION_NAMES.REDIS_VERSION,
          RECOMMENDATION_NAMES.LUA_SCRIPT,
          RECOMMENDATION_NAMES.BIG_AMOUNT_OF_CONNECTED_CLIENTS,
        ],
        mockRedisGeneralInfo,
      );
    });

    it('should recalculate provider if not available in the list of providers', async () => {
      const testHost = 'localhost';
      repository.get.mockResolvedValue({
        host: testHost,
        provider: 'not-in-providers-enum',
      });

      (getHostingProvider as jest.Mock).mockResolvedValue(
        HostingProvider.REDIS_STACK,
      );

      await service.connect(mockCommonClientMetadata);

      expect(getHostingProvider).toHaveBeenCalledWith(
        expect.any(Object),
        testHost,
      );

      expect(repository.update).toHaveBeenCalledWith(
        mockCommonClientMetadata.sessionMetadata,
        mockCommonClientMetadata.databaseId,
        expect.objectContaining({
          provider: HostingProvider.REDIS_STACK,
        }),
      );
    });

    it('should call check try rdi recommendation', async () => {
      featureService.getByName.mockResolvedValueOnce({
        flag: true,
      });

      expect(await service.connect(mockCommonClientMetadata)).toEqual(
        undefined,
      );

      expect(recommendationService.check).toHaveBeenCalledTimes(1);
      expect(recommendationService.checkMulti).toHaveBeenCalledTimes(1);

      expect(recommendationService.checkMulti).toBeCalledWith(
        mockCommonClientMetadata,
        [
          RECOMMENDATION_NAMES.REDIS_VERSION,
          RECOMMENDATION_NAMES.LUA_SCRIPT,
          RECOMMENDATION_NAMES.BIG_AMOUNT_OF_CONNECTED_CLIENTS,
        ],
        mockRedisGeneralInfo,
      );

      expect(recommendationService.check).toBeCalledWith(
        mockCommonClientMetadata,
        RECOMMENDATION_NAMES.TRY_RDI,
        { connectionType: 'STANDALONE', provider: undefined },
      );
    });

    it('should call databaseInfoProvider', async () => {
      expect(await service.connect(mockCommonClientMetadata)).toEqual(
        undefined,
      );

      expect(databaseInfoProvider.determineDatabaseServer).toHaveBeenCalled();
      expect(databaseInfoProvider.determineDatabaseModules).toHaveBeenCalled();
    });

    it('should call getClientListInfo', async () => {
      expect(await service.connect(mockCommonClientMetadata)).toEqual(
        undefined,
      );

      expect(databaseInfoProvider.getClientListInfo).toHaveBeenCalled();
      expect(
        analytics.sendDatabaseConnectedClientListEvent,
      ).toHaveBeenCalledWith(mockSessionMetadata, {
        databaseId: mockDatabase.id,
        clients: mockRedisClientListResult.map((c) => ({
          version: mockRedisGeneralInfo.version,
          resp: get(c, 'resp', 'n/a'),
          libVer: get(c, 'lib-ver', 'n/a'),
          libName: get(c, 'lib-name', 'n/a'),
        })),
      });
    });
  });
});
