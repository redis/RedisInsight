import { SessionMetadata } from 'src/common/models';
import { Environment } from 'src/modules/database/entities/database.entity';
import { DatabaseRepository } from 'src/modules/database/repositories/database.repository';

/**
 * Resolve the database `environment` for analytics emits.
 * Defaults to `Environment.Unspecified` on lookup failure.
 */
export async function resolveEnvironment(
  databaseRepository: DatabaseRepository,
  sessionMetadata: SessionMetadata,
  databaseId: string,
): Promise<Environment> {
  try {
    const database = await databaseRepository.get(sessionMetadata, databaseId);
    return database?.environment ?? Environment.Unspecified;
  } catch (e) {
    return Environment.Unspecified;
  }
}
