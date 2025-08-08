import { renderHook, act, cleanup } from '@testing-library/react-hooks'
import * as reactRedux from 'react-redux'
import { faker } from '@faker-js/faker'
import { cloneDeep } from 'lodash'

import { mockedStore } from 'uiSrc/utils/test-utils'
import { sendPageViewTelemetry } from 'uiSrc/telemetry'
import {
  INSTANCE_ID_MOCK,
  INSTANCES_MOCK,
} from 'uiSrc/mocks/handlers/instances/instancesHandlers'

import { usePageViewTelemetry } from '../usePageViewTelemetry'
import { TelemetryPageView } from '../pageViews'

// Mock the telemetry module, so we don't send actual telemetry data during tests
jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendPageViewTelemetry: jest.fn(),
}))

describe('usePageViewTelemetry', () => {
  let store: typeof mockedStore
  let mockUseSelector: jest.SpyInstance

  const mockPage = faker.helpers.enumValue(TelemetryPageView)

  beforeEach(() => {
    jest.clearAllMocks()

    cleanup()
    store = cloneDeep(mockedStore)
    store.clearActions()

    mockUseSelector = jest.spyOn(reactRedux, 'useSelector')
    mockUseSelector.mockReturnValue(INSTANCES_MOCK[0])
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should send page view telemetry on mount if connected to instance', () => {
    renderHook(() => usePageViewTelemetry({ page: mockPage }))

    expect(sendPageViewTelemetry).toHaveBeenCalledTimes(1)
    expect(sendPageViewTelemetry).toHaveBeenCalledWith({
      name: mockPage,
      eventData: { databaseId: INSTANCE_ID_MOCK },
    })
  })

  it('should not send page view telemetry if instanceId is not available', () => {
    mockUseSelector.mockReturnValueOnce(null)

    renderHook(() => usePageViewTelemetry({ page: mockPage }))

    expect(sendPageViewTelemetry).not.toHaveBeenCalled()
  })

  it('should not send page view telemetry if already sent', () => {
    const { rerender } = renderHook(() =>
      usePageViewTelemetry({ page: mockPage }),
    )

    // Verify initial telemetry call
    expect(sendPageViewTelemetry).toHaveBeenCalledTimes(1)

    // Simulate instance id change in the selector
    mockUseSelector.mockReturnValue(INSTANCES_MOCK[1])
    rerender()

    // Should not send telemetry again
    expect(sendPageViewTelemetry).toHaveBeenCalledTimes(1)
  })

  it('should send page view telemetry with when called manually', () => {
    const { result } = renderHook(() =>
      usePageViewTelemetry({ page: mockPage }),
    )

    // Verify initial telemetry call
    expect(sendPageViewTelemetry).toHaveBeenCalledTimes(1)
    expect(sendPageViewTelemetry).toHaveBeenCalledWith({
      name: mockPage,
      eventData: { databaseId: INSTANCE_ID_MOCK },
    })

    // Call the sendPageView method manually, with custom parameters
    const customPage = faker.helpers.enumValue(TelemetryPageView)
    const customInstanceId = 'custom-instance-1'

    act(() => {
      result.current.sendPageView(customPage, customInstanceId)
    })

    // Verify that the telemetry was sent with the custom parameters
    expect(sendPageViewTelemetry).toHaveBeenCalledTimes(2)
    expect(sendPageViewTelemetry).toHaveBeenCalledWith({
      name: customPage,
      eventData: { databaseId: customInstanceId },
    })
  })
})
