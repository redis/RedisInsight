import { cloneDeep, set } from 'lodash'
import {
  act,
  initialStateDefault,
  mockStore,
  renderHook,
} from 'uiSrc/utils/test-utils'
import { getDatabaseConfigInfo } from 'uiSrc/slices/instances/instances'
import { setConnectivityError } from 'uiSrc/slices/app/connectivity'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { useDatabaseOverview } from './useDatabaseOverview'

// Mock the telemetry function
jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

// Mock the getOverviewMetrics function
jest.mock(
  'uiSrc/components/database-overview/components/OverviewMetrics',
  () => ({
    getOverviewMetrics: jest.fn().mockReturnValue([
      { id: 'cpu', title: 'CPU' },
      { id: 'memory', title: 'Memory' },
      { id: 'keys', title: 'Keys' },
    ]),
  }),
)

const mockInstanceId = 'test-instance-id'
const mockDb = 0

const overviewData = {
  version: '6.0.0',
  usedMemory: 45.2 * 1024 * 1024, // 45.2 MB
  usedMemoryPercent: null,
  totalKeys: 5000,
  connectedClients: 1,
  cpuUsagePercentage: 0.23,
  networkInKbps: 3,
  networkOutKbps: 5,
  opsPerSecond: 10,
  cloudDetails: undefined,
}

const initialState = set(
  cloneDeep(initialStateDefault),
  'connections.instances.instanceOverview',
  overviewData,
)

// Set connected instance
set(initialState, 'connections.instances.connectedInstance', {
  id: mockInstanceId,
  db: mockDb,
})

let mockedStore: ReturnType<typeof mockStore>
let mockDate: Date
type HookReturnType = ReturnType<typeof useDatabaseOverview>

const renderHelper = (store: typeof mockedStore) => {
  const { result } = renderHook(() => useDatabaseOverview(), {
    store,
  })

  return result.current as HookReturnType
}

describe('useDatabaseOverview', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedStore = mockStore(initialState)

    // Set up fake timers
    jest.useFakeTimers()
    mockDate = new Date('2024-11-22T12:00:00Z')
    jest.setSystemTime(mockDate)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should return metrics and other data', () => {
    const data = renderHelper(mockedStore)
    expect(data.metrics).toEqual([
      { id: 'cpu', title: 'CPU' },
      { id: 'memory', title: 'Memory' },
      { id: 'keys', title: 'Keys' },
    ])
    expect(data.connectivityError).toBeUndefined()
    expect(data.lastRefreshTime).not.toBeUndefined()
    expect(data.subscriptionType).toBeUndefined()
    expect(data.subscriptionId).toBeUndefined()
    expect(data.isBdbPackages).toBeUndefined()
    expect(data.usedMemoryPercent).toBeUndefined()
    expect(typeof data.handleRefresh).toBe('function')
    expect(typeof data.handleRefreshClick).toBe('function')
    expect(typeof data.handleEnableAutoRefresh).toBe('function')
  })

  it('should set lastRefreshTime to current timestamp on mount', () => {
    const data = renderHelper(mockedStore)
    expect(data.lastRefreshTime).toBe(mockDate.getTime())
  })

  it('should not dispatch getDatabaseConfigInfoAction when connectivity error exists', () => {
    const stateWithError = set(
      cloneDeep(initialState),
      'app.connectivity.error',
      'Network error',
    )
    mockedStore = mockStore(stateWithError)

    renderHook(() => useDatabaseOverview(), {
      store: mockedStore,
    })

    const actions = mockedStore.getActions()
    expect(actions).not.toContainEqual(getDatabaseConfigInfo())
  })

  it('should calculate usedMemoryPercent when cloud plan limit is present', () => {
    const stateWithCloudDetails = set(
      cloneDeep(initialState),
      'connections.instances.instanceOverview.cloudDetails',
      {
        cloudId: 123,
        subscriptionId: 456,
        subscriptionType: 'fixed',
        planMemoryLimit: 75,
        memoryLimitMeasurementUnit: 'MB',
      },
    )
    mockedStore = mockStore(stateWithCloudDetails)

    const data = renderHelper(mockedStore)

    // 45.2 MB / 75 MB ≈ 60.3%
    expect(data.usedMemoryPercent).toBeCloseTo(60.3, 1)
    expect(data.subscriptionType).toBe('fixed')
    expect(data.subscriptionId).toBe(456)
  })

  it('should handle refresh correctly', () => {
    const data = renderHelper(mockedStore)

    // Clear previous actions
    mockedStore.clearActions()

    act(() => {
      data.handleRefresh()
    })

    const actions = mockedStore.getActions()
    expect(actions).toContainEqual(getDatabaseConfigInfo())
  })

  it('should handle refresh click correctly', () => {
    // Clear previous actions
    mockedStore.clearActions()

    const data = renderHelper(mockedStore)
    act(() => {
      data.handleRefreshClick()
    })

    const actions = mockedStore.getActions()
    expect(actions).toContainEqual(setConnectivityError(null))
  })

  it('should send telemetry event when auto-refresh is enabled', () => {
    const data = renderHelper(mockedStore)
    act(() => {
      data.handleEnableAutoRefresh(true, '30')
    })

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.OVERVIEW_AUTO_REFRESH_ENABLED,
      eventData: {
        databaseId: mockInstanceId,
        refreshRate: 30,
      },
    })
  })

  it('should send telemetry event when auto-refresh is disabled', () => {
    const data = renderHelper(mockedStore)
    act(() => {
      data.handleEnableAutoRefresh(false, '30')
    })

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.OVERVIEW_AUTO_REFRESH_DISABLED,
      eventData: {
        databaseId: mockInstanceId,
        refreshRate: 30,
      },
    })
  })

  it('should handle flexible subscription type correctly', () => {
    const stateWithFlexibleSubscription = set(
      cloneDeep(initialState),
      'connections.instances.instanceOverview.cloudDetails',
      {
        cloudId: 123,
        subscriptionId: 456,
        subscriptionType: 'flexible',
        planMemoryLimit: 75,
        memoryLimitMeasurementUnit: 'MB',
      },
    )
    mockedStore = mockStore(stateWithFlexibleSubscription)
    const data = renderHelper(mockedStore)

    expect(data.subscriptionType).toBe('flexible')
  })

  it('should handle BDB packages flag correctly', () => {
    const stateWithBdbPackages = set(
      cloneDeep(initialState),
      'connections.instances.instanceOverview.cloudDetails',
      {
        cloudId: 123,
        subscriptionId: 456,
        subscriptionType: 'fixed',
        planMemoryLimit: 75,
        memoryLimitMeasurementUnit: 'MB',
        isBdbPackages: true,
      },
    )
    mockedStore = mockStore(stateWithBdbPackages)
    const data = renderHelper(mockedStore)

    expect(data.isBdbPackages).toBe(true)
  })
})
