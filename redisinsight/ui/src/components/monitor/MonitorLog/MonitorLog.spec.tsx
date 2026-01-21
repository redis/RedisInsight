import { cloneDeep } from 'lodash'
import React from 'react'
import {
  monitorSelector,
  resetProfiler,
  stopMonitor,
} from 'uiSrc/slices/cli/monitor'
import {
  act,
  cleanup,
  fireEvent,
  mockedStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import { sendCliCommand } from 'uiSrc/slices/cli/cli-output'
import MonitorLog from './MonitorLog'

let store: typeof mockedStore
const mockURLrevokeObjectURL = 123123

jest.mock('file-saver', () => ({
  ...jest.requireActual('file-saver'),
  saveAs: jest.fn(),
}))

jest.mock('uiSrc/slices/cli/monitor', () => ({
  ...jest.requireActual('uiSrc/slices/cli/monitor'),
  monitorSelector: jest.fn().mockReturnValue({
    isSaveToFile: false,
    logFileId: 'logFileId',
    timestamp: {
      start: 1,
      paused: 2,
      unPaused: 3,
      duration: 123,
    },
  }),
}))

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('MonitorLog', () => {
  beforeAll(() => {
    jest
      .spyOn(URL, 'revokeObjectURL')
      .mockImplementation(() => mockURLrevokeObjectURL)
  })

  it('should render', () => {
    expect(render(<MonitorLog />)).toBeTruthy()
  })

  it('should call proper actions on click reset profiler', () => {
    render(<MonitorLog />)
    fireEvent.click(screen.getByTestId('reset-profiler-btn'))

    const expectedActions = [stopMonitor(), resetProfiler()]
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should call fetchMonitorLog after click on Download', async () => {
    const monitorSelectorMock = jest.fn().mockReturnValue({
      isSaveToFile: true,
      logFileId: 'logFileId',
      timestamp: {
        start: 1,
        paused: 2,
        unPaused: 3,
        duration: 123,
      },
    })

    ;(monitorSelector as jest.Mock).mockImplementation(monitorSelectorMock)

    render(<MonitorLog />)

    await act(() => {
      fireEvent.click(screen.getByTestId('download-log-btn'))
    })

    const expectedActions = [sendCliCommand()]
    expect(store.getActions().slice(0, expectedActions.length)).toEqual(
      expectedActions,
    )
  })
})
