import React from 'react'
import { cleanup, fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import * as useDatabaseModeModule from 'uiSrc/components/hooks/useDatabaseMode'
import ProfilerStartButton from './ProfilerStartButton'

const mockUseDatabaseMode = (
  mode: useDatabaseModeModule.UseDatabaseModeResult['mode'],
) =>
  jest.spyOn(useDatabaseModeModule, 'useDatabaseMode').mockReturnValue({
    mode,
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
    mockUseDatabaseMode('unmarked')
    render(<ProfilerStartButton onStart={jest.fn()} />)
    expect(screen.getByTestId('start-monitor')).toBeInTheDocument()
  })

  it.each(['fast', 'unmarked', 'disabled'] as const)(
    'should call onStart directly when mode is "%s"',
    (mode) => {
      mockUseDatabaseMode(mode)
      const onStart = jest.fn()
      render(<ProfilerStartButton onStart={onStart} />)

      fireEvent.click(screen.getByTestId('start-monitor'))

      expect(onStart).toHaveBeenCalledTimes(1)
      expect(screen.queryByTestId('confirm-popover')).not.toBeInTheDocument()
    },
  )

  describe('in production mode', () => {
    beforeEach(() => {
      mockUseDatabaseMode('production')
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
