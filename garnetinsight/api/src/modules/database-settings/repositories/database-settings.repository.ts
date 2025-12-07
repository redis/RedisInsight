import { SessionMetadata } from 'src/common/models';
import { DatabaseSettings } from '../models/database-settings';

export abstract class DatabaseSettingsRepository {
  abstract createOrUpdate(
    sessionMetadata: SessionMetadata,
    setting: Partial<DatabaseSettings>,
  ): Promise<DatabaseSettings>;

  abstract get(
    sessionMetadata: SessionMetadata,
    databaseId: string,
  ): Promise<DatabaseSettings>;

  abstract delete(
    sessionMetadata: SessionMetadata,
    databaseId: string,
  ): Promise<void>;
}
