import React from 'react'
import { Environment } from 'apiClient'
import { cleanup, fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import * as useDatabaseEnvironmentModule from 'uiSrc/components/hooks/useDatabaseEnvironment'
import MonitorNotStarted from './MonitorNotStarted'

beforeEach(() => {
  cleanup()
  jest
    .spyOn(useDatabaseEnvironmentModule, 'useDatabaseEnvironment')
    .mockReturnValue({
      environment: Environment.Unspecified,
      isDangerousCommand: () => false,
    })
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('MonitorNotStarted', () => {
  it('should render the not-started container and warning banner', () => {
    render(
      <MonitorNotStarted
        saveLogValue={false}
        setSaveLogValue={jest.fn()}
        onStart={jest.fn()}
      />,
    )

    expect(screen.getByTestId('monitor-not-started')).toBeInTheDocument()
    expect(screen.getByTestId('monitor-warning-message')).toBeInTheDocument()
    expect(screen.getByTestId('start-monitor')).toBeInTheDocument()
  })

  it('should call onStart when the Start button is clicked', () => {
    const onStart = jest.fn()
    render(
      <MonitorNotStarted
        saveLogValue={false}
        setSaveLogValue={jest.fn()}
        onStart={onStart}
      />,
    )

    fireEvent.click(screen.getByTestId('start-monitor'))

    expect(onStart).toHaveBeenCalledTimes(1)
  })
})
