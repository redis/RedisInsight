import { Injectable, Logger } from '@nestjs/common';
import { sum } from 'lodash';
import { plainToInstance } from 'class-transformer';
import { DatabaseRecommendationRepository } from 'src/modules/database-recommendation/repositories/database-recommendation.repository';
import { DatabaseRecommendation } from 'src/modules/database-recommendation/models';
import { RecommendationScanner } from 'src/modules/database-recommendation/scanner/recommendations.scanner';
import { ClientMetadata } from 'src/common/models';
import { DatabaseRecommendationsResponse } from 'src/modules/database-recommendation/dto/database-recommendations.response';
import { Recommendation } from 'src/modules/database-analysis/models/recommendation';
import {
  ModifyDatabaseRecommendationDto,
  DeleteDatabaseRecommendationResponse,
} from './dto';
import { DatabaseRecommendationAnalytics } from './database-recommendation.analytics';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class DatabaseRecommendationService {
  private logger = new Logger('DatabaseRecommendationService');

  constructor(
    private readonly databaseRecommendationRepository: DatabaseRecommendationRepository,
    private readonly scanner: RecommendationScanner,
    private readonly databaseService: DatabaseService,
    private readonly analytics: DatabaseRecommendationAnalytics,
  ) {}

  /**
   * Create recommendation entity
   * @param clientMetadata
   * @param entity
   */
  public async create(
    clientMetadata: ClientMetadata,
    entity: DatabaseRecommendation,
  ): Promise<DatabaseRecommendation> {
    const recommendation = await this.databaseRecommendationRepository.create(
      clientMetadata.sessionMetadata,
      entity,
    );

    const database = await this.databaseService.get(
      clientMetadata.sessionMetadata,
      clientMetadata?.databaseId,
    );

    this.analytics.sendCreatedRecommendationEvent(
      clientMetadata.sessionMetadata,
      recommendation,
      database,
    );

    return recommendation;
  }

  /**
   * Get recommendations list for particular database
   * @param clientMetadata
   */
  async list(
    clientMetadata: ClientMetadata,
  ): Promise<DatabaseRecommendationsResponse> {
    this.logger.debug('Getting database recommendations', clientMetadata);
    const db =
      clientMetadata.db ??
      (
        await this.databaseService.get(
          clientMetadata.sessionMetadata,
          clientMetadata.databaseId,
        )
      )?.db ??
      0;
    return this.databaseRecommendationRepository.list({
      ...clientMetadata,
      db,
    });
  }

  private async checkRecommendation(
    recommendationName: string,
    exists: boolean,
    clientMetadata: ClientMetadata,
    data: any,
  ): Promise<DatabaseRecommendation> {
    if (!exists) {
      const recommendation = await this.scanner.determineRecommendation(
        clientMetadata.sessionMetadata,
        recommendationName,
        data,
      );

      if (recommendation) {
        const entity = plainToInstance(DatabaseRecommendation, {
          databaseId: clientMetadata?.databaseId,
          ...recommendation,
        });

        return await this.create(clientMetadata, entity);
      }
    }

    return null;
  }

  public async checkMulti(
    clientMetadata: ClientMetadata,
    recommendationNames: string[],
    data: any,
  ): Promise<Record<string, DatabaseRecommendation>> {
    try {
      const newClientMetadata = {
        ...clientMetadata,
        db:
          clientMetadata.db ??
          (
            await this.databaseService.get(
              clientMetadata.sessionMetadata,
              clientMetadata.databaseId,
            )
          )?.db ??
          0,
      };
      const isRecommendationExist =
        await this.databaseRecommendationRepository.isExistMulti(
          newClientMetadata,
          recommendationNames,
        );

      const results = await Promise.all(
        recommendationNames.map((name) =>
          this.checkRecommendation(
            name,
            isRecommendationExist[name],
            newClientMetadata,
            data,
          ),
        ),
      );

      return results.reduce(
        (acc, result, idx) => ({
          ...acc,
          [recommendationNames[idx]]: result,
        }),
        {},
      );
    } catch (e) {
      this.logger.warn('Unable to check recommendation', e, clientMetadata);
      return {};
    }
  }

  /**
   * Check recommendation condition
   * @param clientMetadata
   * @param recommendationName
   * @param data
   */
  public async check(
    clientMetadata: ClientMetadata,
    recommendationName: string,
    data: any,
  ): Promise<DatabaseRecommendation> {
    try {
      const result = await this.checkMulti(
        clientMetadata,
        [recommendationName],
        data,
      );
      return result[recommendationName];
    } catch (e) {
      return null;
    }
  }

  /**
   * Mark all recommendations as read for particular database
   * @param clientMetadata
   */
  public async read(clientMetadata: ClientMetadata): Promise<void> {
    this.logger.debug('Reading database recommendations');
    return this.databaseRecommendationRepository.read(clientMetadata);
  }

  /**
   * Update extended recommendation
   * @param clientMetadata
   * @param id
   * @param dto
   */
  public async update(
    clientMetadata: ClientMetadata,
    id: string,
    dto: ModifyDatabaseRecommendationDto,
  ): Promise<DatabaseRecommendation> {
    this.logger.debug(
      `Update database extended recommendations id:${id}`,
      clientMetadata,
    );
    return this.databaseRecommendationRepository.update(
      clientMetadata,
      id,
      dto,
    );
  }

  /**
   * Sync db analysis recommendations and live recommendations
   * @param clientMetadata
   * @param recommendations
   */
  public async sync(
    clientMetadata: ClientMetadata,
    recommendations: Recommendation[],
  ): Promise<void> {
    return this.databaseRecommendationRepository.sync(
      clientMetadata,
      recommendations,
    );
  }

  /**
   * Delete database recommendation by id
   * @param clientMetadata
   * @param id
   */
  async delete(clientMetadata: ClientMetadata, id: string): Promise<void> {
    this.logger.debug(`Deleting recommendation: ${id}`, clientMetadata);
    await this.databaseRecommendationRepository.delete(clientMetadata, id);
  }

  /**
   * Bulk delete recommendations. Uses "delete" method and skipping error
   * Returns successfully deleted recommendations number
   * @param clientMetadata
   * @param ids
   */
  async bulkDelete(
    clientMetadata: ClientMetadata,
    ids: string[],
  ): Promise<DeleteDatabaseRecommendationResponse> {
    this.logger.debug(`Deleting many recommendations: ${ids}`, clientMetadata);

    return {
      affected: sum(
        await Promise.all(
          ids.map(async (id) => {
            try {
              await this.delete(clientMetadata, id);
              return 1;
            } catch (e) {
              return 0;
            }
          }),
        ),
      ),
    };
  }
}
