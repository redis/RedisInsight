import { getDatabaseMode } from 'uiSrc/utils/databaseMode'

describe('getDatabaseMode', () => {
  it('returns disabled when flag is off regardless of row', () => {
    expect(
      getDatabaseMode(
        { isProduction: true },
        { flagEnabled: false, skipConfirmations: true },
      ),
    ).toBe('disabled')
  })

  it('returns production when flag on and row is production', () => {
    expect(
      getDatabaseMode(
        { isProduction: true },
        { flagEnabled: true, skipConfirmations: false },
      ),
    ).toBe('production')
  })

  it('returns fast for non-prod row when skip-confirmations is on', () => {
    expect(
      getDatabaseMode(
        { isProduction: false },
        { flagEnabled: true, skipConfirmations: true },
      ),
    ).toBe('fast')
  })

  it('returns unmarked for non-prod row when skip-confirmations is off', () => {
    expect(
      getDatabaseMode(
        { isProduction: false },
        { flagEnabled: true, skipConfirmations: false },
      ),
    ).toBe('unmarked')
  })

  it('treats undefined isProduction as not production', () => {
    expect(
      getDatabaseMode({}, { flagEnabled: true, skipConfirmations: false }),
    ).toBe('unmarked')
  })

  it('returns disabled for a null row when flag is off', () => {
    expect(
      getDatabaseMode(null, {
        flagEnabled: false,
        skipConfirmations: false,
      }),
    ).toBe('disabled')
  })

  it('treats a null row as not production when flag is on', () => {
    expect(
      getDatabaseMode(null, {
        flagEnabled: true,
        skipConfirmations: false,
      }),
    ).toBe('unmarked')
  })
})
