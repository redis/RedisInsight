import { Instance } from 'uiSrc/slices/interfaces'

export type DatabaseMode = 'production' | 'fast' | 'unmarked' | 'disabled'

export const getDatabaseMode = (
  database: Pick<Instance, 'isProduction'> | null | undefined,
  {
    flagEnabled,
    skipConfirmations,
  }: { flagEnabled: boolean; skipConfirmations: boolean },
): DatabaseMode => {
  if (!flagEnabled) return 'disabled'
  if (database?.isProduction) return 'production'
  if (skipConfirmations) return 'fast'
  return 'unmarked'
}
