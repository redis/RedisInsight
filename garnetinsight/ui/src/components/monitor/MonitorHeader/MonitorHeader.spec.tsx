import React from 'react'
import { cloneDeep } from 'lodash'
import { instance, mock } from 'ts-mockito'
import {
  cleanup,
  fireEvent,
  mockedStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import {
  monitorSelector,
  resetMonitorItems,
  setMonitorInitialState,
  toggleHideMonitor,
  toggleMonitor,
} from 'uiSrc/slices/cli/monitor'
import MonitorHeader, { Props } from './MonitorHeader'

const mockedProps = mock<Props>()
const monitorPath = 'uiSrc/slices/cli/monitor'
let store: typeof mockedStore

jest.mock(monitorPath, () => {
  const defaultState = jest.requireActual(monitorPath).initialState
  return {
    ...jest.requireActual(monitorPath),
    monitorSelector: jest.fn().mockReturnValue({
      ...defaultState,
      isMinimizedMonitor: false,
      isShowMonitor: true,
    }),
  }
})

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('MonitorHeader', () => {
  it('should render', () => {
    expect(render(<MonitorHeader {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should "setMonitorInitialState" action be called after click "close-monitor" button', () => {
    render(<MonitorHeader {...instance(mockedProps)} />)
    fireEvent.click(screen.getByTestId('close-monitor'))

    const expectedActions = [setMonitorInitialState()]
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should "toggleCliHelper" action be called after click "hide-monitor" button', () => {
    render(<MonitorHeader {...instance(mockedProps)} />)
    fireEvent.click(screen.getByTestId('hide-monitor'))

    const expectedActions = [toggleMonitor(), toggleHideMonitor()]
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('Should call handleRunMonitor after click on the play button', () => {
    const handleRunMonitor = jest.fn()
    const monitorSelectorMock = jest.fn().mockReturnValue({
      isStarted: true,
    })
    monitorSelector.mockImplementation(monitorSelectorMock)
    render(<MonitorHeader handleRunMonitor={handleRunMonitor} />)

    fireEvent.click(screen.getByTestId('toggle-run-monitor'))

    expect(handleRunMonitor).toHaveBeenCalled()
  })

  it('Should clear Monitor items after click on the clear button', () => {
    const monitorSelectorMock = jest.fn().mockReturnValue({
      isStarted: true,
    })
    monitorSelector.mockImplementation(monitorSelectorMock)
    render(<MonitorHeader {...instance(mockedProps)} />)

    fireEvent.click(screen.getByTestId('clear-monitor'))

    const expectedActions = [resetMonitorItems()]
    expect(store.getActions()).toEqual(expectedActions)
  })
})
