import { SessionMetadata } from 'src/common/models';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DatabaseSettingsEntity } from 'src/modules/database-settings/entities/database-setting.entity';
import { classToClass } from 'src/utils';
import {
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import ERROR_MESSAGES from 'src/constants/error-messages';
import { plainToInstance } from 'class-transformer';
import { DatabaseSettingsRepository } from './database-settings.repository';
import { DatabaseSettings } from '../models/database-settings';

export class LocalDatabaseSettingsRepository extends DatabaseSettingsRepository {
  private readonly logger = new Logger('LocalDatabaseSettingsRepository');

  constructor(
    @InjectRepository(DatabaseSettingsEntity)
    private readonly repository: Repository<DatabaseSettingsEntity>,
  ) {
    super();
  }

  async createOrUpdate(
    _sessionMetadata: SessionMetadata,
    setting: Partial<DatabaseSettings>,
  ): Promise<DatabaseSettings> {
    const settingsEntity = plainToInstance(DatabaseSettingsEntity, setting);
    const existing = await this.repository.findOneBy({
      databaseId: setting.databaseId,
    });

    if (existing) {
      // update
      settingsEntity.id = existing.id;
    }
    const entity = await this.repository.save(settingsEntity);
    return classToClass(DatabaseSettings, entity);
  }

  async get(
    sessionMetadata: SessionMetadata,
    databaseId: string,
  ): Promise<DatabaseSettings> {
    const entity = await this.repository.findOneBy({ databaseId });

    if (!entity) {
      this.logger.error(
        `Database settings item with id:${databaseId} was not Found`,
        sessionMetadata,
      );
      throw new NotFoundException(ERROR_MESSAGES.DATABASE_SETTINGS_NOT_FOUND);
    }

    return classToClass(DatabaseSettings, entity);
  }

  /**
   * Delete settings per database
   * @param sessionMetadata
   * @param databaseId
   */
  async delete(
    sessionMetadata: SessionMetadata,
    databaseId: string,
  ): Promise<void> {
    try {
      await this.repository.delete({ databaseId });
    } catch (error) {
      this.logger.error(
        `Failed to delete database settings item: ${databaseId}`,
        error,
        sessionMetadata,
      );
      throw new InternalServerErrorException();
    }
  }
}
