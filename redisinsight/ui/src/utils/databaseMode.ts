import { DatabaseMode } from 'apiClient'
import { Instance } from 'uiSrc/slices/interfaces'

export { DatabaseMode }

// Returns the effective database mode for UI gates. When the dev-prodMode
// feature flag is off (or no row is supplied), falls back to Unmarked so
// no friction is applied — equivalent to the feature being inactive.
export const getDatabaseMode = (
  database: Pick<Instance, 'databaseMode'> | null | undefined,
  { flagEnabled }: { flagEnabled: boolean },
): DatabaseMode => {
  if (!flagEnabled) return DatabaseMode.Unmarked
  return database?.databaseMode ?? DatabaseMode.Unmarked
}
