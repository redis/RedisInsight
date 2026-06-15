import React from 'react'
import { Environment } from 'apiClient'
import { cleanup, fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import * as useDatabaseEnvironmentModule from 'uiSrc/components/hooks/useDatabaseEnvironment'
import ProfilerStartButton from './ProfilerStartButton'

const mockUseEnvironment = (
  environment: useDatabaseEnvironmentModule.UseDatabaseEnvironmentResult['environment'],
) =>
  jest
    .spyOn(useDatabaseEnvironmentModule, 'useDatabaseEnvironment')
    .mockReturnValue({
      environment,
      isDangerousCommand: () => false,
    })

beforeEach(() => {
  cleanup()
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('ProfilerStartButton', () => {
  it('should render the Start Profiler button', () => {
    mockUseEnvironment(Environment.Unspecified)
    render(<ProfilerStartButton onStart={jest.fn()} />)
    expect(screen.getByTestId('start-monitor')).toBeInTheDocument()
  })

  it.each([Environment.Development, Environment.Unspecified])(
    'should call onStart directly when mode is "%s"',
    (mode) => {
      mockUseEnvironment(mode)
      const onStart = jest.fn()
      render(<ProfilerStartButton onStart={onStart} />)

      fireEvent.click(screen.getByTestId('start-monitor'))

      expect(onStart).toHaveBeenCalledTimes(1)
      expect(screen.queryByTestId('confirm-popover')).not.toBeInTheDocument()
    },
  )

  describe('in production mode', () => {
    beforeEach(() => {
      mockUseEnvironment(Environment.Production)
    })

    it('should open the confirmation popover and not call onStart on first click', () => {
      const onStart = jest.fn()
      render(<ProfilerStartButton onStart={onStart} />)

      fireEvent.click(screen.getByTestId('start-monitor'))

      expect(onStart).not.toHaveBeenCalled()
      expect(screen.getByTestId('confirm-popover')).toBeInTheDocument()
    })

    it('should call onStart when the user confirms', () => {
      const onStart = jest.fn()
      render(<ProfilerStartButton onStart={onStart} />)

      fireEvent.click(screen.getByTestId('start-monitor'))
      fireEvent.click(screen.getByTestId('profiler-start-confirm'))

      expect(onStart).toHaveBeenCalledTimes(1)
    })

    it('should not call onStart and close the popover when the user cancels', () => {
      const onStart = jest.fn()
      render(<ProfilerStartButton onStart={onStart} />)

      fireEvent.click(screen.getByTestId('start-monitor'))
      fireEvent.click(screen.getByTestId('profiler-start-cancel'))

      expect(onStart).not.toHaveBeenCalled()
      expect(screen.queryByTestId('confirm-popover')).not.toBeInTheDocument()
    })
  })
})
