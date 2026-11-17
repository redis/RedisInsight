import { faker } from '@faker-js/faker'
import { store, RootState } from 'uiSrc/slices/store'
import {
  checkIsAnalyticsGranted,
  getInstallationId,
} from 'uiSrc/telemetry/checkAnalytics'

/** Minimal slice of state these two readers touch. */
const mockState = ({
  serverId,
  analytics,
}: {
  serverId?: string | null
  analytics?: boolean
}) =>
  ({
    app: { info: { server: serverId ? { id: serverId } : null } },
    user: { settings: { config: { agreements: { analytics } } } },
  }) as unknown as RootState

const mockStoreState = (state: RootState) =>
  jest.spyOn(store, 'getState').mockReturnValue(state)

afterEach(() => {
  jest.restoreAllMocks()
})

describe('checkIsAnalyticsGranted', () => {
  it.each([
    { analytics: true, expected: true },
    { analytics: false, expected: false },
    { analytics: undefined, expected: false },
  ])(
    'returns $expected when the agreement is $analytics',
    ({ analytics, expected }) => {
      mockStoreState(mockState({ analytics }))

      expect(checkIsAnalyticsGranted()).toBe(expected)
    },
  )
})

describe('getInstallationId', () => {
  it('returns the server id once GET /info has resolved', () => {
    const serverId = faker.string.uuid()
    mockStoreState(mockState({ serverId }))

    expect(getInstallationId()).toBe(serverId)
  })

  it('returns undefined while server info is still null', () => {
    mockStoreState(mockState({ serverId: null }))

    expect(getInstallationId()).toBeUndefined()
  })

  it('returns the id regardless of the consent agreement', () => {
    const serverId = faker.string.uuid()
    mockStoreState(mockState({ serverId, analytics: false }))

    expect(getInstallationId()).toBe(serverId)
  })
})
