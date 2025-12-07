import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseRecommendationEntity } from 'src/modules/database-recommendation/entities/database-recommendation.entity';
import { DatabaseRecommendationRepository } from 'src/modules/database-recommendation/repositories/database-recommendation.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { DatabaseRecommendation } from 'src/modules/database-recommendation/models';
import { ModifyDatabaseRecommendationDto } from 'src/modules/database-recommendation/dto';
import { EncryptionService } from 'src/modules/encryption/encryption.service';
import { Recommendation } from 'src/modules/database-analysis/models/recommendation';
import { ClientMetadata, SessionMetadata } from 'src/common/models';
import { sortRecommendations, classToClass } from 'src/utils';

import ERROR_MESSAGES from 'src/constants/error-messages';
import { DatabaseRecommendationsResponse } from 'src/modules/database-recommendation/dto/database-recommendations.response';
import { RecommendationEvents } from 'src/modules/database-recommendation/constants';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ModelEncryptor } from 'src/modules/encryption/model.encryptor';

@Injectable()
export class LocalDatabaseRecommendationRepository extends DatabaseRecommendationRepository {
  private readonly logger = new Logger('DatabaseRecommendationRepository');

  private readonly modelEncryptor: ModelEncryptor;

  constructor(
    @InjectRepository(DatabaseRecommendationEntity)
    private readonly repository: Repository<DatabaseRecommendationEntity>,
    private eventEmitter: EventEmitter2,
    private readonly encryptionService: EncryptionService,
  ) {
    super();
    this.modelEncryptor = new ModelEncryptor(encryptionService, ['params']);
  }

  /**
   * Save entire entity
   * @param sessionMetadata
   * @param entity
   */
  async create(
    sessionMetadata: SessionMetadata,
    entity: DatabaseRecommendation,
  ): Promise<DatabaseRecommendation> {
    this.logger.debug('Creating database recommendation', sessionMetadata);

    try {
      const model = await this.repository.save(
        await this.modelEncryptor.encryptEntity(
          plainToInstance(DatabaseRecommendationEntity, entity),
        ),
      );

      const recommendation = classToClass(
        DatabaseRecommendation,
        await this.modelEncryptor.decryptEntity(model, true),
      );
      this.eventEmitter.emit(RecommendationEvents.NewRecommendation, {
        sessionMetadata,
        recommendations: [recommendation],
      });

      return recommendation;
    } catch (err) {
      this.logger.error(
        'Failed to create database recommendation',
        err,
        sessionMetadata,
      );

      return null;
    }
  }

  /**
   * Return list of database recommendations
   * @param clientMetadata
   */
  async list(
    clientMetadata: ClientMetadata,
  ): Promise<DatabaseRecommendationsResponse> {
    const { databaseId } = clientMetadata;
    this.logger.debug('Getting database recommendations list', clientMetadata);
    const entities = await this.repository
      .createQueryBuilder('r')
      .where({ databaseId })
      .select([
        'r.id',
        'r.name',
        'r.read',
        'r.vote',
        'r.hide',
        'r.params',
        'r.encryption',
      ])
      .orderBy('r.createdAt', 'DESC')
      .getMany();

    const totalUnread = await this.repository
      .createQueryBuilder()
      .where({ databaseId, read: false })
      .getCount();

    this.logger.debug('Succeed to get recommendations', clientMetadata);
    const decryptedEntities = await Promise.all(
      entities.map(async (entity) => {
        try {
          return await this.modelEncryptor.decryptEntity(entity, true);
        } catch (e) {
          return null;
        }
      }),
    );
    return classToClass(DatabaseRecommendationsResponse, {
      recommendations: decryptedEntities,
      totalUnread,
    });
  }

  /**
   * Read all recommendations
   * @param clientMetadata
   */
  async read(clientMetadata: ClientMetadata): Promise<void> {
    const { databaseId } = clientMetadata;
    this.logger.debug('Marking all recommendations as read', clientMetadata);
    await this.repository
      .createQueryBuilder('r')
      .update()
      .where({ databaseId })
      .set({ read: true })
      .execute();
  }

  /**
   * Update and return updated DatabaseRecommendation model
   * @param clientMetadata
   * @param id
   * @param recommendation
   */
  async update(
    clientMetadata: ClientMetadata,
    id: string,
    recommendation: ModifyDatabaseRecommendationDto,
  ): Promise<DatabaseRecommendation> {
    this.logger.debug(
      `Updating database recommendation with id:${id}`,
      clientMetadata,
    );
    const oldEntity = await this.modelEncryptor.decryptEntity(
      await this.repository.findOneBy({ id }),
    );
    const newEntity = plainToInstance(
      DatabaseRecommendationEntity,
      recommendation,
    );

    if (!oldEntity) {
      this.logger.error(
        `Database recommendation with id:${id} was not Found`,
        clientMetadata,
      );
      throw new NotFoundException(
        ERROR_MESSAGES.DATABASE_RECOMMENDATION_NOT_FOUND,
      );
    }

    const mergeResult = this.repository.merge(oldEntity, newEntity);
    await this.repository.update(
      id,
      await this.modelEncryptor.encryptEntity(mergeResult),
    );

    this.logger.debug(
      `Updated database recommendation with id:${id}`,
      clientMetadata,
    );

    return this.get(clientMetadata.sessionMetadata, id);
  }

  /**
   * Check is recommendation exist in database
   * @param clientMetadata
   * @param name
   */
  async isExist(
    clientMetadata: ClientMetadata,
    name: string,
  ): Promise<boolean> {
    const { databaseId } = clientMetadata;
    try {
      this.logger.debug(
        `Checking is recommendation ${name} exist`,
        clientMetadata,
      );
      const recommendation = await this.repository.findOneBy({
        databaseId,
        name,
      });

      this.logger.debug(
        `Succeed to check is recommendation ${name} exist'`,
        clientMetadata,
      );
      return !!recommendation;
    } catch (err) {
      this.logger.error(
        `Failed to check is recommendation ${name} exist'`,
        err,
        clientMetadata,
      );
      return false;
    }
  }

  /**
   * Check if one or more recommendations exist in database
   * @param clientMetadata
   * @param names
   */
  async isExistMulti(
    clientMetadata: ClientMetadata,
    names: string[],
  ): Promise<Map<string, boolean>> {
    const { databaseId } = clientMetadata;

    try {
      this.logger.debug(
        'Checking if recommendations exist',
        names,
        clientMetadata,
      );

      const results = await Promise.all(
        names.map((name) => this.repository.findOneBy({ databaseId, name })),
      );

      return results.reduce(
        (acc, result, idx) => ({
          ...acc,
          [names[idx]]: !!result,
        }),
        {} as Map<string, boolean>,
      );
    } catch (err) {
      this.logger.error(
        'Failed to check existence of recommendations',
        err,
        names,
        clientMetadata,
      );
      return {} as Map<string, boolean>;
    }
  }

  /**
   * Get recommendation by id
   * @param sessionMetadata
   * @param id
   */
  public async get(
    sessionMetadata: SessionMetadata,
    id: string,
  ): Promise<DatabaseRecommendation> {
    this.logger.debug(`Getting recommendation with id: ${id}`, sessionMetadata);

    const entity = await this.repository.findOneBy({ id });
    const model = classToClass(
      DatabaseRecommendation,
      await this.modelEncryptor.decryptEntity(entity, true),
    );

    if (!model) {
      this.logger.error(
        `Not found recommendation with id: ${id}'`,
        sessionMetadata,
      );
      return null;
    }

    this.logger.debug(
      `Succeed to get recommendation with id: ${id}'`,
      sessionMetadata,
    );
    return model;
  }

  /**
   * Sync db analysis recommendations with live recommendations
   * @param clientMetadata
   * @param dbAnalysisRecommendations
   */
  async sync(
    clientMetadata: ClientMetadata,
    dbAnalysisRecommendations: Recommendation[],
  ): Promise<void> {
    this.logger.debug('Synchronization of recommendations', clientMetadata);
    try {
      const sortedRecommendations = sortRecommendations(
        dbAnalysisRecommendations,
      );
      for (let i = 0; i < sortedRecommendations.length; i += 1) {
        if (
          !(await this.isExist(clientMetadata, sortedRecommendations[i].name))
        ) {
          const entity = plainToInstance(DatabaseRecommendation, {
            databaseId: clientMetadata?.databaseId,
            name: sortedRecommendations[i].name,
            params: sortedRecommendations[i].params,
          });
          await this.create(clientMetadata.sessionMetadata, entity);
        }
      }
    } catch (e) {
      // ignore errors
      this.logger.error(e);
    }
  }

  /**
   * Delete recommendation by id
   * @param clientMetadata,
   * @param id
   */
  public async delete(
    clientMetadata: ClientMetadata,
    id: string,
  ): Promise<void> {
    const { databaseId } = clientMetadata;
    try {
      const { affected } = await this.repository.delete({ databaseId, id });

      if (!affected) {
        this.logger.error(
          `Recommendation with id:${id} was not Found`,
          clientMetadata,
        );
        return Promise.reject(
          new NotFoundException(
            ERROR_MESSAGES.DATABASE_RECOMMENDATION_NOT_FOUND,
          ),
        );
      }

      this.logger.debug('Succeed to delete recommendation.', clientMetadata);
    } catch (error) {
      this.logger.error(`Failed to delete recommendation: ${id}`, error);
      throw new InternalServerErrorException(error.message);
    }
  }

  public async getTotalUnread(
    _: SessionMetadata,
    databaseId: string,
  ): Promise<number> {
    return await this.repository
      .createQueryBuilder()
      .where({ read: false, databaseId })
      .getCount();
  }
}
