import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseAnalysisEntity } from 'src/modules/database-analysis/entities/database-analysis.entity';
import { isUndefined } from 'lodash';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { plainToInstance } from 'class-transformer';
import {
  DatabaseAnalysis,
  ShortDatabaseAnalysis,
} from 'src/modules/database-analysis/models';
import { RecommendationVoteDto } from 'src/modules/database-analysis/dto';
import { classToClass } from 'src/utils';
import config from 'src/utils/config';
import ERROR_MESSAGES from 'src/constants/error-messages';

const DATABASE_ANALYSIS_CONFIG = config.get('database_analysis');

@Injectable()
export class DatabaseAnalysisProvider {
  private readonly logger = new Logger('DatabaseAnalysisProvider');

  private readonly encryptedFields = [
    'totalKeys',
    'totalMemory',
    'topKeysNsp',
    'topMemoryNsp',
    'topKeysLength',
    'topKeysMemory',
    'filter',
    'progress',
    'expirationGroups',
    'recommendations',
  ];

  constructor(
    @InjectRepository(DatabaseAnalysisEntity)
    private readonly repository: Repository<DatabaseAnalysisEntity>,
    private readonly encryptionService: EncryptionService,
  ) {}

  /**
   * Encrypt database analysis and save entire entity
   * Should always throw and error in case when unable to encrypt for some reason
   * @param analysis
   */
  async create(analysis: Partial<DatabaseAnalysis>): Promise<DatabaseAnalysis> {
    const entity = await this.repository.save(
      await this.encryptEntity(
        plainToInstance(DatabaseAnalysisEntity, analysis),
      ),
    );

    // cleanup history and ignore error if any
    try {
      await this.cleanupDatabaseHistory(entity.databaseId);
    } catch (e) {
      this.logger.error('Error when trying to cleanup history after insert', e);
    }

    return classToClass(DatabaseAnalysis, await this.decryptEntity(entity));
  }

  /**
   * Fetches entity, decrypt and return full DatabaseAnalysis model
   * @param id
   */
  async get(id: string): Promise<DatabaseAnalysis> {
    const entity = await this.repository.findOneBy({ id });

    if (!entity) {
      this.logger.error(`Database analysis with id:${id} was not Found`);
      throw new NotFoundException(ERROR_MESSAGES.DATABASE_ANALYSIS_NOT_FOUND);
    }

    return classToClass(
      DatabaseAnalysis,
      await this.decryptEntity(entity, true),
    );
  }

  /**
   * Fetches entity, decrypt, update and return updated DatabaseAnalysis model
   * @param id
   * @param dto
   */
  async recommendationVote(
    id: string,
    dto: RecommendationVoteDto,
  ): Promise<DatabaseAnalysis> {
    this.logger.debug('Updating database analysis with recommendation vote');
    const { name, vote } = dto;
    const oldDatabaseAnalysis = await this.repository.findOneBy({ id });

    if (!oldDatabaseAnalysis) {
      this.logger.error(`Database analysis with id:${id} was not Found`);
      throw new NotFoundException(ERROR_MESSAGES.DATABASE_ANALYSIS_NOT_FOUND);
    }

    const entity = classToClass(
      DatabaseAnalysis,
      await this.decryptEntity(oldDatabaseAnalysis, true),
    );

    entity.recommendations = entity.recommendations.map((recommendation) =>
      recommendation.name === name
        ? { ...recommendation, vote }
        : recommendation,
    );

    await this.repository.update(
      id,
      await this.encryptEntity(plainToInstance(DatabaseAnalysisEntity, entity)),
    );

    return entity;
  }

  /**
   * Return list of database analysis with several fields only
   * @param databaseId
   */
  async list(databaseId: string): Promise<ShortDatabaseAnalysis[]> {
    this.logger.debug('Getting database analysis list');
    const entities = await this.repository
      .createQueryBuilder('a')
      .where({ databaseId })
      .select(['a.id', 'a.createdAt', 'a.db'])
      .orderBy('a.createdAt', 'DESC')
      .limit(DATABASE_ANALYSIS_CONFIG.maxItemsPerDb)
      .getMany();

    this.logger.debug('Succeed to get command executions');

    return entities.map((entity) =>
      classToClass(ShortDatabaseAnalysis, entity),
    );
  }

  /**
   * Clean history for particular database to fit 30 items limitation
   * @param databaseId
   */
  async cleanupDatabaseHistory(databaseId: string): Promise<void> {
    // todo: investigate why delete with sub-query doesn't works
    const idsToDelete = (
      await this.repository
        .createQueryBuilder()
        .where({ databaseId })
        .select('id')
        .orderBy('createdAt', 'DESC')
        .offset(DATABASE_ANALYSIS_CONFIG.maxItemsPerDb)
        .getRawMany()
    ).map((item) => item.id);

    await this.repository
      .createQueryBuilder()
      .delete()
      .whereInIds(idsToDelete)
      .execute();
  }

  /**
   * Encrypt required database analysis fields based on picked encryption strategy
   * Should always throw an encryption error to determine that something wrong
   * with encryption strategy
   *
   * @param entity
   * @private
   */
  private async encryptEntity(
    entity: DatabaseAnalysisEntity,
  ): Promise<DatabaseAnalysisEntity> {
    const encryptedEntity = {
      ...entity,
    };

    await Promise.all(
      this.encryptedFields.map(async (field) => {
        if (entity[field]) {
          const { data, encryption } = await this.encryptionService.encrypt(
            entity[field],
          );
          encryptedEntity[field] = data;
          encryptedEntity['encryption'] = encryption;
        }
      }),
    );

    return encryptedEntity;
  }

  /**
   * Decrypt required database analysis fields
   * This method should optionally not fail (to not block users to navigate across app
   * on decryption error, for example, to be able change encryption strategy in the future)
   *
   * When ignoreErrors = true will return null for failed fields.
   * It will cause 401 Unauthorized errors when user tries to connect to redis database
   *
   * @param entity
   * @param ignoreErrors
   * @private
   */
  private async decryptEntity(
    entity: DatabaseAnalysisEntity,
    ignoreErrors: boolean = false,
  ): Promise<DatabaseAnalysisEntity> {
    const decrypted = {
      ...entity,
    };

    await Promise.all(
      this.encryptedFields.map(async (field) => {
        decrypted[field] = await this.decryptField(entity, field, ignoreErrors);
      }),
    );

    return new DatabaseAnalysisEntity({
      ...decrypted,
    });
  }

  /**
   * Decrypt single field if exists
   *
   * @param entity
   * @param field
   * @param ignoreErrors
   * @private
   */
  private async decryptField(
    entity: DatabaseAnalysisEntity,
    field: string,
    ignoreErrors: boolean,
  ): Promise<string> {
    if (isUndefined(entity[field])) {
      return undefined;
    }

    try {
      return await this.encryptionService.decrypt(
        entity[field],
        entity.encryption,
      );
    } catch (error) {
      this.logger.error(
        `Unable to decrypt database analysis ${entity.id} fields: ${field}`,
        error,
      );
      if (!ignoreErrors) {
        throw error;
      }
    }

    return null;
  }
}
