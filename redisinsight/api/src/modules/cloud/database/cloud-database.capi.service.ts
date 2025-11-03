import { Injectable, Logger } from '@nestjs/common';
import { wrapHttpError } from 'src/common/utils';
import { CloudCapiAuthDto } from 'src/modules/cloud/common/dto';
import {
  GetCloudSubscriptionDatabaseDto,
  GetCloudSubscriptionDatabasesDto,
} from 'src/modules/cloud/database/dto';
import { CloudDatabaseCapiProvider } from 'src/modules/cloud/database/cloud-database.capi.provider';
import {
  CloudDatabase,
  CloudDatabaseAlertName,
  CloudDatabaseDataEvictionPolicy,
  CloudDatabasePersistencePolicy,
  CloudDatabaseProtocol,
} from 'src/modules/cloud/database/models';
import {
  parseCloudDatabaseCapiResponse,
  parseCloudDatabasesCapiResponse,
} from 'src/modules/cloud/database/utils';
import config from 'src/utils/config';
import { parseCloudTaskCapiResponse } from 'src/modules/cloud/task/utils';

const cloudConfig = config.get('cloud');

@Injectable()
export class CloudDatabaseCapiService {
  private logger = new Logger('CloudDatabaseCapiService');

  constructor(private readonly capi: CloudDatabaseCapiProvider) {}

  /**
   * Get single database details
   * @param authDto
   * @param dto
   */
  async getDatabase(
    authDto: CloudCapiAuthDto,
    dto: GetCloudSubscriptionDatabaseDto,
  ): Promise<CloudDatabase> {
    try {
      this.logger.debug('Getting cloud database', dto);

      const [database, tags] = await Promise.all([
        this.capi.getDatabase(authDto, dto),
        this.capi.getDatabaseTags(authDto, dto),
      ]);

      this.logger.debug('Succeed to get databases in RE cloud subscription.');

      return parseCloudDatabaseCapiResponse(
        database,
        tags,
        dto.subscriptionId,
        dto.subscriptionType,
        dto.free,
      );
    } catch (e) {
      this.logger.error('Failed to get cloud database', e);
      throw wrapHttpError(e);
    }
  }

  /**
   * Get list of databases from subscription
   * @param authDto
   * @param dto
   */
  async getDatabases(
    authDto: CloudCapiAuthDto,
    dto: GetCloudSubscriptionDatabasesDto,
  ): Promise<CloudDatabase[]> {
    try {
      this.logger.debug('Getting cloud databases from subscription');

      const data = await this.capi.getDatabases(authDto, dto);

      this.logger.debug('Succeed to get cloud databases from subscription.');

      return parseCloudDatabasesCapiResponse(
        data,
        dto.subscriptionType,
        dto.free,
      );
    } catch (e) {
      throw wrapHttpError(e);
    }
  }

  /**
   * Creating free database along with subscription if needed
   * @param authDto
   * @param dto
   */
  async createFreeDatabase(
    authDto: CloudCapiAuthDto,
    dto: GetCloudSubscriptionDatabasesDto,
  ) {
    try {
      this.logger.debug('Creating free database');

      const task = await this.capi.createFreeDatabase(authDto, {
        ...dto,
        name: cloudConfig.freeDatabaseName,
        protocol: CloudDatabaseProtocol.Stack,
        dataPersistence: CloudDatabasePersistencePolicy.None,
        dataEvictionPolicy: CloudDatabaseDataEvictionPolicy.VolatileLru,
        replication: false,
        alerts: [
          {
            name: CloudDatabaseAlertName.ConnectionsLimit,
            value: 80,
          },
          {
            name: CloudDatabaseAlertName.DatasetsSize,
            value: 80,
          },
        ],
      });

      return parseCloudTaskCapiResponse(task);
    } catch (e) {
      this.logger.error('Unable to create free database', e);
      throw wrapHttpError(e);
    }
  }
}
