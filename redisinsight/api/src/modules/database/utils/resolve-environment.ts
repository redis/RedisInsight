import { SessionMetadata } from 'src/common/models';
import { Environment } from 'src/modules/database/entities/database.entity';
import { DatabaseRepository } from 'src/modules/database/repositories/database.repository';

/**
 * Resolve the `environment` classification (`Environment` enum) for a
 * database. Mirrors the analytics emit convention established by
 * `database.analytics.ts` after RI-8198 collapsed the prior
 * `isProduction` boolean into a tri-state enum
 * (`unspecified` | `production` | `development`).
 *
 * Wrapped in try/catch and defaults to `Environment.Unspecified` on lookup
 * failure so analytics callers never block the request path on a missing /
 * corrupt database row.
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
