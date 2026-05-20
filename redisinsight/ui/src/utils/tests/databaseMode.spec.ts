import { DatabaseMode } from 'apiClient'
import { getDatabaseMode } from 'uiSrc/utils/databaseMode'

describe('getDatabaseMode', () => {
  it('falls back to unmarked when flag is off regardless of row', () => {
    expect(
      getDatabaseMode(
        { databaseMode: DatabaseMode.Production },
        { flagEnabled: false },
      ),
    ).toBe('unmarked')
  })

  it('returns production when flag on and row is production', () => {
    expect(
      getDatabaseMode(
        { databaseMode: DatabaseMode.Production },
        { flagEnabled: true },
      ),
    ).toBe('production')
  })

  it('returns fast when flag on and row is fast', () => {
    expect(
      getDatabaseMode(
        { databaseMode: DatabaseMode.Fast },
        { flagEnabled: true },
      ),
    ).toBe('fast')
  })

  it('returns unmarked when flag on and row is unmarked', () => {
    expect(
      getDatabaseMode(
        { databaseMode: DatabaseMode.Unmarked },
        { flagEnabled: true },
      ),
    ).toBe('unmarked')
  })

  it('treats a null row as unmarked when flag is off', () => {
    expect(getDatabaseMode(null, { flagEnabled: false })).toBe('unmarked')
  })

  it('treats a null row as unmarked when flag is on', () => {
    expect(getDatabaseMode(null, { flagEnabled: true })).toBe('unmarked')
  })
})
