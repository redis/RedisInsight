import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { CloudDatabaseEndpointInvalidException } from 'src/modules/cloud/job/exceptions';
import { uniqBy } from 'lodash';
import ERROR_MESSAGES from 'src/constants/error-messages';
import {
  DiscoverCloudDatabasesDto,
  ImportCloudDatabaseDto,
  ImportCloudDatabaseResponse,
} from 'src/modules/cloud/autodiscovery/dto';
import { CloudAutodiscoveryAuthType } from 'src/modules/cloud/autodiscovery/models';
import { DatabaseService } from 'src/modules/database/database.service';
import { HostingProvider } from 'src/modules/database/entities/database.entity';
import { ActionStatus, SessionMetadata } from 'src/common/models';
import { CloudAutodiscoveryAnalytics } from 'src/modules/cloud/autodiscovery/cloud-autodiscovery.analytics';
import { CloudCapiAuthDto } from 'src/modules/cloud/common/dto';
import { CloudSubscriptionCapiService } from 'src/modules/cloud/subscription/cloud-subscription.capi.service';
import { wrapHttpError } from 'src/common/utils';
import { CloudUserCapiService } from 'src/modules/cloud/user/cloud-user.capi.service';
import { CloudDatabaseCapiService } from 'src/modules/cloud/database/cloud-database.capi.service';
import { CloudAccountInfo } from 'src/modules/cloud/user/models';
import {
  CloudSubscription,
  CloudSubscriptionType,
} from 'src/modules/cloud/subscription/models';
import {
  CloudDatabase,
  CloudDatabaseStatus,
} from 'src/modules/cloud/database/models';
import config from 'src/utils/config';

const cloudConfig = config.get('cloud');

@Injectable()
export class CloudAutodiscoveryService {
  private logger = new Logger('CloudAutodiscoveryService');

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly cloudSubscriptionCapiService: CloudSubscriptionCapiService,
    private readonly cloudUserCapiService: CloudUserCapiService,
    private readonly cloudDatabaseCapiService: CloudDatabaseCapiService,
    private readonly analytics: CloudAutodiscoveryAnalytics,
  ) {}

  /**
   * Get cloud account short info
   * @param authDto
   */
  async getAccount(authDto: CloudCapiAuthDto): Promise<CloudAccountInfo> {
    try {
      return await this.cloudUserCapiService.getCurrentAccount(authDto);
    } catch (e) {
      this.logger.error('Error when getting current user account', e);
      throw wrapHttpError(e);
    }
  }

  /**
   * Get subscriptions by type
   * @param sessionMetadata
   * @param authDto
   * @param type
   * @param authType
   */
  private async getSubscriptions(
    sessionMetadata: SessionMetadata,
    authDto: CloudCapiAuthDto,
    type: CloudSubscriptionType,
    authType: CloudAutodiscoveryAuthType,
  ): Promise<CloudSubscription[]> {
    try {
      const subscriptions =
        await this.cloudSubscriptionCapiService.getSubscriptions(authDto, type);
      this.analytics.sendGetRedisCloudSubsSucceedEvent(
        sessionMetadata,
        subscriptions,
        type,
        authType,
      );
      return subscriptions;
    } catch (e) {
      this.logger.error(
        'Failed get redis cloud subscriptions',
        sessionMetadata,
        e,
      );
      this.analytics.sendGetRedisCloudSubsFailedEvent(
        sessionMetadata,
        e,
        type,
        authType,
      );
      throw wrapHttpError(e);
    }
  }

  /**
   * Discover all subscriptions
   * @param sessionMetadata
   * @param authDto
   * @param authType
   */
  async discoverSubscriptions(
    sessionMetadata: SessionMetadata,
    authDto: CloudCapiAuthDto,
    authType: CloudAutodiscoveryAuthType,
  ): Promise<CloudSubscription[]> {
    return [].concat(
      ...(await Promise.all([
        this.getSubscriptions(
          sessionMetadata,
          authDto,
          CloudSubscriptionType.Fixed,
          authType,
        ),
        this.getSubscriptions(
          sessionMetadata,
          authDto,
          CloudSubscriptionType.Flexible,
          authType,
        ),
      ])),
    );
  }

  /**
   * Get all databases from specified multiple subscriptions
   * @param sessionMetadata
   * @param authDto
   * @param dto
   * @param authType
   */
  async discoverDatabases(
    sessionMetadata: SessionMetadata,
    authDto: CloudCapiAuthDto,
    dto: DiscoverCloudDatabasesDto,
    authType: CloudAutodiscoveryAuthType,
  ): Promise<CloudDatabase[]> {
    let result = [];
    try {
      this.logger.debug(
        'Discovering cloud databases from subscription(s)',
        sessionMetadata,
      );

      const subscriptions = uniqBy(
        dto.subscriptions,
        ({ subscriptionId, subscriptionType }) =>
          [subscriptionId, subscriptionType].join(),
      );

      await Promise.all(
        subscriptions.map(async (subscription) => {
          const databases = await this.cloudDatabaseCapiService.getDatabases(
            authDto,
            subscription,
          );
          result = result.concat(databases);
        }),
      );

      this.analytics.sendGetRedisCloudDbsSucceedEvent(
        sessionMetadata,
        result,
        authType,
      );
      return result;
    } catch (e) {
      this.logger.error(
        'Error when discovering cloud databases from subscription(s)',
        sessionMetadata,
        e,
      );
      this.analytics.sendGetRedisCloudDbsFailedEvent(
        sessionMetadata,
        e,
        authType,
      );

      throw wrapHttpError(e);
    }
  }

  /**
   * Add database from cloud
   * @param sessionMetadata
   * @param authDto
   * @param addDatabasesDto
   */
  async addRedisCloudDatabases(
    sessionMetadata: SessionMetadata,
    authDto: CloudCapiAuthDto,
    addDatabasesDto: ImportCloudDatabaseDto[],
  ): Promise<ImportCloudDatabaseResponse[]> {
    this.logger.debug('Adding Redis Cloud databases.', sessionMetadata);

    return Promise.all(
      addDatabasesDto.map(
        async (
          dto: ImportCloudDatabaseDto,
        ): Promise<ImportCloudDatabaseResponse> => {
          let database: CloudDatabase;
          try {
            database = await this.cloudDatabaseCapiService.getDatabase(
              authDto,
              dto,
            );

            const { publicEndpoint, name, password, status, tags } = database;
            if (status !== CloudDatabaseStatus.Active) {
              const exception = new ServiceUnavailableException(
                ERROR_MESSAGES.DATABASE_IS_INACTIVE,
              );
              return {
                ...dto,
                status: ActionStatus.Fail,
                message: exception.message,
                error: exception?.getResponse(),
                databaseDetails: database,
              };
            }
            if (!publicEndpoint) {
              const exception = new CloudDatabaseEndpointInvalidException();
              return {
                ...dto,
                status: ActionStatus.Fail,
                message: exception.message,
                error: exception?.getResponse(),
                databaseDetails: database,
              };
            }
            const [host, port] = publicEndpoint.split(':');

            await this.databaseService.create(sessionMetadata, {
              host,
              port: parseInt(port, 10),
              name,
              nameFromProvider: name,
              password,
              provider: HostingProvider.REDIS_CLOUD,
              cloudDetails: database?.cloudDetails,
              tags,
              timeout: cloudConfig.cloudDatabaseConnectionTimeout,
            });

            return {
              ...dto,
              status: ActionStatus.Success,
              message: 'Added',
              databaseDetails: database,
            };
          } catch (error) {
            this.logger.error(
              'Adding cloud database failed with an error',
              sessionMetadata,
              error,
            );
            return {
              ...dto,
              status: ActionStatus.Fail,
              message: error.message,
              error: error?.response,
              databaseDetails: database,
            };
          }
        },
      ),
    );
  }
}
