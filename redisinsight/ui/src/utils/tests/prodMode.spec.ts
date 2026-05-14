import { getProdModeForDatabase } from 'uiSrc/utils/prodMode'

describe('getProdModeForDatabase', () => {
  it('returns disabled when flag is off regardless of row', () => {
    expect(
      getProdModeForDatabase(
        { isProduction: true },
        { flagEnabled: false, skipConfirmations: true },
      ),
    ).toBe('disabled')
  })

  it('returns production when flag on and row is production', () => {
    expect(
      getProdModeForDatabase(
        { isProduction: true },
        { flagEnabled: true, skipConfirmations: false },
      ),
    ).toBe('production')
  })

  it('returns fast for non-prod row when skip-confirmations is on', () => {
    expect(
      getProdModeForDatabase(
        { isProduction: false },
        { flagEnabled: true, skipConfirmations: true },
      ),
    ).toBe('fast')
  })

  it('returns unmarked for non-prod row when skip-confirmations is off', () => {
    expect(
      getProdModeForDatabase(
        { isProduction: false },
        { flagEnabled: true, skipConfirmations: false },
      ),
    ).toBe('unmarked')
  })

  it('treats undefined isProduction as not production', () => {
    expect(
      getProdModeForDatabase(
        {},
        { flagEnabled: true, skipConfirmations: false },
      ),
    ).toBe('unmarked')
  })

  it('returns disabled for a null row when flag is off', () => {
    expect(
      getProdModeForDatabase(null, {
        flagEnabled: false,
        skipConfirmations: false,
      }),
    ).toBe('disabled')
  })

  it('treats a null row as not production when flag is on', () => {
    expect(
      getProdModeForDatabase(null, {
        flagEnabled: true,
        skipConfirmations: false,
      }),
    ).toBe('unmarked')
  })
})
