import { HttpException, Injectable, Logger } from '@nestjs/common';
import { catchAclError } from 'src/utils';
import { plainToInstance } from 'class-transformer';
import { SessionMetadata } from 'src/common/models';
import { DatabaseSettingsRepository } from './repositories/database-settings.repository';
import { CreateOrUpdateDatabaseSettingDto } from './dto/database-setting.dto';
import { DatabaseSettings } from './models/database-settings';

@Injectable()
export class DatabaseSettingsService {
  private logger = new Logger('DatabaseSettingsService');

  constructor(
    private readonly databaseSettingsRepository: DatabaseSettingsRepository,
  ) {}

  /**
   * Create or update a setting
   *
   * @param sessionMetadata
   * @param databaseId
   * @param dto
   */
  public async createOrUpdate(
    sessionMetadata: SessionMetadata,
    databaseId: string,
    dto: CreateOrUpdateDatabaseSettingDto,
  ): Promise<DatabaseSettings> {
    try {
      const setting = plainToInstance(DatabaseSettings, { ...dto, databaseId });
      return this.databaseSettingsRepository.createOrUpdate(
        sessionMetadata,
        setting,
      );
    } catch (e) {
      this.logger.error(
        'Unable to create database setting',
        e,
        sessionMetadata,
      );

      if (e instanceof HttpException) {
        throw e;
      }

      throw catchAclError(e);
    }
  }

  /**
   * Get database settings
   *
   * @param sessionMetadata
   * @param id
   */
  async get(
    sessionMetadata: SessionMetadata,
    id: string,
  ): Promise<DatabaseSettings> {
    return this.databaseSettingsRepository.get(sessionMetadata, id);
  }

  /**
   * Delete database settings
   * @param sessionMetadata
   * @param databaseId
   */
  async delete(
    sessionMetadata: SessionMetadata,
    databaseId: string,
  ): Promise<void> {
    return this.databaseSettingsRepository.delete(sessionMetadata, databaseId);
  }
}
