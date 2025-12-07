import { cloneDeep } from 'lodash'
import React from 'react'
import { useSelector } from 'react-redux'
import { RdiInstance } from 'uiSrc/slices/interfaces'
import { loadInstancesSuccess } from 'uiSrc/slices/rdi/instances'
import { RootState, store } from 'uiSrc/slices/store'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import {
  act,
  cleanup,
  fireEvent,
  mockedStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'

import SearchRdiList from './SearchRdiList'

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

let storeMock: typeof mockedStore
const instancesMock: RdiInstance[] = [
  {
    id: '1',
    name: 'My first integration',
    url: 'redis-12345.c253.us-central1-1.gce.cloud.redislabs.com:12345',
    lastConnection: new Date(),
    version: '1.2',
    visible: true,
    error: '',
    loading: false,
  },
  {
    id: '2',
    name: 'My second integration',
    url: 'redis-67890.c253.us-central1-1.gce.cloud.redislabs.com:67890',
    lastConnection: new Date(),
    version: '1.3',
    visible: true,
    error: '',
    loading: false,
  },
]

describe('SearchRdiList', () => {
  beforeEach(() => {
    cleanup()
    storeMock = cloneDeep(mockedStore)
    storeMock.clearActions()

    const state: RootState = store.getState()
    ;(useSelector as jest.Mock).mockImplementation(
      (callback: (arg0: RootState) => RootState) =>
        callback({
          ...state,
          rdi: {
            ...state.rdi,
            instances: {
              ...state.rdi.instances,
              data: instancesMock,
            },
          },
        }),
    )
  })

  it('should render', () => {
    expect(render(<SearchRdiList />)).toBeTruthy()
  })

  it('should call proper telemetry on instance search', async () => {
    const sendEventTelemetryMock = jest.fn()

    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )
    render(<SearchRdiList />)

    await act(() => {
      fireEvent.change(screen.getByTestId('search-rdi-instance-list'), {
        target: { value: 'first int' },
      })
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_INSTANCE_LIST_SEARCHED,
      eventData: {
        instancesFullCount: 2,
        instancesSearchedCount: 1,
      },
    })
  })

  it('should return all results if filter is blank', async () => {
    render(<SearchRdiList />)

    await act(() => {
      fireEvent.change(screen.getByTestId('search-rdi-instance-list'), {
        target: { value: ' ' },
      })
    })

    const expectedActions = [loadInstancesSuccess(instancesMock)]
    expect(storeMock.getActions()).toEqual(expectedActions)
  })

  it('should filter by name', async () => {
    const newInstancesMock = [...instancesMock]
    render(<SearchRdiList />)

    await act(() => {
      fireEvent.change(screen.getByTestId('search-rdi-instance-list'), {
        target: { value: 'second int' },
      })
    })

    newInstancesMock[0].visible = false
    newInstancesMock[1].visible = true

    const expectedActions = [loadInstancesSuccess(newInstancesMock)]
    expect(storeMock.getActions()).toEqual(expectedActions)
  })

  it('should filter by url', async () => {
    const newInstancesMock = [...instancesMock]
    render(<SearchRdiList />)

    await act(() => {
      fireEvent.change(screen.getByTestId('search-rdi-instance-list'), {
        target: { value: 'redislabs.com:12345' },
      })
    })

    newInstancesMock[0].visible = true
    newInstancesMock[1].visible = false

    const expectedActions = [loadInstancesSuccess(newInstancesMock)]
    expect(storeMock.getActions()).toEqual(expectedActions)
  })

  it('should filter by version', async () => {
    const newInstancesMock = [...instancesMock]
    render(<SearchRdiList />)

    await act(() => {
      fireEvent.change(screen.getByTestId('search-rdi-instance-list'), {
        target: { value: '1.2' },
      })
    })

    newInstancesMock[0].visible = true
    newInstancesMock[1].visible = false

    const expectedActions = [loadInstancesSuccess(newInstancesMock)]
    expect(storeMock.getActions()).toEqual(expectedActions)
  })

  it('should filter by lastConnection', async () => {
    const newInstancesMock = [...instancesMock]
    render(<SearchRdiList />)

    await act(() => {
      fireEvent.change(screen.getByTestId('search-rdi-instance-list'), {
        target: { value: 'minute ago' },
      })
    })

    newInstancesMock[0].visible = true
    newInstancesMock[1].visible = true

    const expectedActions = [loadInstancesSuccess(newInstancesMock)]
    expect(storeMock.getActions()).toEqual(expectedActions)
  })
})
