import { Instance } from 'uiSrc/slices/interfaces'

export type DatabaseMode = 'production' | 'fast' | 'unmarked' | 'disabled'

export const getDatabaseMode = (
  database: Pick<Instance, 'databaseMode'> | null | undefined,
  { flagEnabled }: { flagEnabled: boolean },
): DatabaseMode => {
  if (!flagEnabled) return 'disabled'
  return database?.databaseMode ?? 'unmarked'
}
