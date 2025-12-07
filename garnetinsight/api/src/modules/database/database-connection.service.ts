import { Injectable, Logger } from '@nestjs/common';
import { RECOMMENDATION_NAMES } from 'src/constants';
import { DatabaseRepository } from 'src/modules/database/repositories/database.repository';
import { DatabaseAnalytics } from 'src/modules/database/database.analytics';
import { HostingProvider } from 'src/modules/database/entities/database.entity';
import { DatabaseInfoProvider } from 'src/modules/database/providers/database-info.provider';
import { DatabaseRecommendationService } from 'src/modules/database-recommendation/database-recommendation.service';
import { Database } from 'src/modules/database/models/database';
import { ClientMetadata } from 'src/common/models';
import { DatabaseClientFactory } from 'src/modules/database/providers/database.client.factory';
import {
  RedisClient,
  RedisClientConnectionType,
} from 'src/modules/redis/client';
import { FeatureService } from 'src/modules/feature/feature.service';
import { KnownFeatures } from 'src/modules/feature/constants';
import { getHostingProvider } from 'src/utils/hosting-provider-helper';

@Injectable()
export class DatabaseConnectionService {
  private logger = new Logger('DatabaseConnectionService');

  constructor(
    private readonly databaseClientFactory: DatabaseClientFactory,
    private readonly databaseInfoProvider: DatabaseInfoProvider,
    private readonly repository: DatabaseRepository,
    private readonly analytics: DatabaseAnalytics,
    private readonly featureService: FeatureService,
    private recommendationService: DatabaseRecommendationService,
  ) {}

  /**
   * Connects to database and updates modules list, last connected time
   * and provider if not available in the list of providers
   * @param clientMetadata
   */
  async connect(clientMetadata: ClientMetadata): Promise<void> {
    const client =
      await this.databaseClientFactory.getOrCreateClient(clientMetadata);
    // refresh modules list and last connected time
    // mark database as not a new
    // will be refreshed after user navigate to particular database from the databases list
    // Note: move to a different place in case if we need to update such info more often
    const toUpdate: Partial<Database> = {
      new: false,
      lastConnection: new Date(),
      modules: await this.databaseInfoProvider.determineDatabaseModules(client),
      version: await this.databaseInfoProvider.determineDatabaseServer(client),
    };

    const { host, provider } = await this.repository.get(
      clientMetadata.sessionMetadata,
      clientMetadata.databaseId,
    );

    if (!HostingProvider[provider]) {
      toUpdate.provider = await getHostingProvider(client, host);
    }

    const connectionType = client?.getConnectionType();
    // Update cluster nodes db record
    if (connectionType === RedisClientConnectionType.CLUSTER) {
      toUpdate.nodes = (await client.nodes()).map(({ options }) => ({
        host: options.host,
        port: options.port,
      }));
    }

    await this.repository.update(
      clientMetadata.sessionMetadata,
      clientMetadata.databaseId,
      toUpdate,
    );

    const generalInfo =
      await this.databaseInfoProvider.getRedisGeneralInfo(client);

    this.recommendationService.checkMulti(
      clientMetadata,
      [
        RECOMMENDATION_NAMES.REDIS_VERSION,
        RECOMMENDATION_NAMES.LUA_SCRIPT,
        RECOMMENDATION_NAMES.BIG_AMOUNT_OF_CONNECTED_CLIENTS,
      ],
      generalInfo,
    );

    const rdiFeature = await this.featureService.getByName(
      clientMetadata.sessionMetadata,
      KnownFeatures.Rdi,
    );

    if (rdiFeature?.flag) {
      const database = await this.repository.get(
        clientMetadata.sessionMetadata,
        clientMetadata.databaseId,
      );
      this.recommendationService.check(
        clientMetadata,
        RECOMMENDATION_NAMES.TRY_RDI,
        { connectionType, provider: database.provider },
      );
    }

    this.collectClientInfo(clientMetadata, client, generalInfo?.version);

    this.logger.debug(
      `Succeed to connect to database ${clientMetadata.databaseId}`,
      clientMetadata,
    );
  }

  private async collectClientInfo(
    clientMetadata: ClientMetadata,
    client: RedisClient,
    version?: string,
  ) {
    try {
      const intVersion = parseInt(version, 10) || 0;
      const clients =
        (await this.databaseInfoProvider.getClientListInfo(client)) || [];

      this.analytics.sendDatabaseConnectedClientListEvent(
        clientMetadata.sessionMetadata,
        {
          databaseId: clientMetadata.databaseId,
          ...(client.isInfoCommandDisabled
            ? { info_command_is_disabled: true }
            : {}),
          clients: clients.map((c) => ({
            version: version || 'n/a',
            resp: intVersion < 7 ? undefined : c?.['resp'] || 'n/a',
            libName: intVersion < 7 ? undefined : c?.['lib-name'] || 'n/a',
            libVer: intVersion < 7 ? undefined : c?.['lib-ver'] || 'n/a',
          })),
        },
      );
    } catch (error) {
      // ignore errors
    }
  }
}
