import { has } from 'lodash'
import { isVersionHigher } from 'uiSrc/utils/comparisons/compareVersions'

// returns true if has different consents
export const isDifferentConsentsExists = (specs: any, applied: any) => !!compareConsents(specs, applied).length

export const compareConsents = (
  specs: any = {},
  applied: any = {},
  isReturnAllNonRequired: boolean = false,
): any[] => {
  if (!specs) {
    return []
  }
  return Object.keys(specs)
    .filter(
      (consent) =>
        (isReturnAllNonRequired && !specs[consent]?.required) ||
        applied === null ||
        !has(applied, consent) ||
        isVersionHigher(specs[consent]?.since, applied.version),
    )
    .map((consent) => ({ ...specs[consent], agreementName: consent }))
}
