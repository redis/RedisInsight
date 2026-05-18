import { SessionMetadata } from 'src/common/models';
import { DatabaseRepository } from 'src/modules/database/repositories/database.repository';

/**
 * Resolve the `isProduction` flag for a database, returning the
 * analytics-friendly string representation (`'true' | 'false'`).
 *
 * Wrapped in try/catch and defaults to `'false'` on lookup failure so analytics
 * callers never block the request path on a missing/corrupt database row.
 *
 * Matches the convention established by `database.analytics.ts`
 * (`isProduction: instance?.isProduction ? 'true' : 'false'`).
 */
export async function resolveIsProduction(
  databaseRepository: DatabaseRepository,
  sessionMetadata: SessionMetadata,
  databaseId: string,
): Promise<'true' | 'false'> {
  try {
    const database = await databaseRepository.get(sessionMetadata, databaseId);
    return database?.isProduction ? 'true' : 'false';
  } catch (e) {
    return 'false';
  }
}
