import { Instance } from 'uiSrc/slices/interfaces'

export type ProdMode = 'production' | 'fast' | 'unmarked' | 'disabled'

export const getProdModeForDatabase = (
  database: Pick<Instance, 'isProduction'> | null | undefined,
  {
    flagEnabled,
    skipConfirmations,
  }: { flagEnabled: boolean; skipConfirmations: boolean },
): ProdMode => {
  if (!flagEnabled) return 'disabled'
  if (database?.isProduction) return 'production'
  if (skipConfirmations) return 'fast'
  return 'unmarked'
}
