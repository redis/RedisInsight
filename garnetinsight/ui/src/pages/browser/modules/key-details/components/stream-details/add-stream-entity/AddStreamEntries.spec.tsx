import React from 'react'
import { mock } from 'ts-mockito'
import { render, screen, act, fireEvent } from 'uiSrc/utils/test-utils'

import { streamDataSelector } from 'uiSrc/slices/browser/stream'
import AddStreamEntries, { Props } from './AddStreamEntries'

const mockedProps = mock<Props>()

jest.mock('uiSrc/slices/browser/stream', () => ({
  ...jest.requireActual('uiSrc/slices/browser/stream'),
  streamDataSelector: jest.fn().mockReturnValue({}),
}))

describe('AddStreamEntries', () => {
  it('should render', () => {
    expect(render(<AddStreamEntries {...mockedProps} />)).toBeTruthy()
  })

  it('should be valid by default', () => {
    render(<AddStreamEntries {...mockedProps} />)

    expect(screen.getByTestId('save-elements-btn')).not.toBeDisabled()
  })

  it('should properly validate/show error', async () => {
    ;(streamDataSelector as jest.Mock).mockReturnValue({
      lastGeneratedId: '100-0',
    })
    render(<AddStreamEntries {...mockedProps} />)

    await act(() => {
      fireEvent.change(screen.getByTestId('entryId'), {
        target: { value: '99-0' },
      })
    })

    expect(screen.getByTestId('stream-entry-error')).toHaveTextContent(
      'Must be greater than the last ID',
    )
    expect(screen.getByTestId('save-elements-btn')).toBeDisabled()
  })

  it('should properly validate', async () => {
    ;(streamDataSelector as jest.Mock).mockReturnValue({
      lastGeneratedId: '100-0',
    })
    render(<AddStreamEntries {...mockedProps} />)

    await act(() => {
      fireEvent.change(screen.getByTestId('entryId'), {
        target: { value: '101-0' },
      })
    })

    expect(screen.queryByTestId('stream-entry-error')).not.toBeInTheDocument()
    expect(screen.getByTestId('save-elements-btn')).not.toBeDisabled()
  })
})
