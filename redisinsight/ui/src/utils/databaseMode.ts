import { DatabaseMode as PersistedDatabaseMode } from 'apiClient'
import { Instance } from 'uiSrc/slices/interfaces'

// Runtime mode driving UI gates: persisted enum values plus 'disabled'
// (returned when the dev-prodMode feature flag is off).
export type DatabaseMode = `${PersistedDatabaseMode}` | 'disabled'

export const getDatabaseMode = (
  database: Pick<Instance, 'databaseMode'> | null | undefined,
  { flagEnabled }: { flagEnabled: boolean },
): DatabaseMode => {
  if (!flagEnabled) return 'disabled'
  return database?.databaseMode ?? PersistedDatabaseMode.Unmarked
}
