import React from 'react'
import { cloneDeep } from 'lodash'
import {
  act,
  cleanup,
  fireEvent,
  mockedStore,
  render,
  screen,
  waitFor,
} from 'uiSrc/utils/test-utils'
import ConfirmationPopover from './ConfirmationPopover'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

const mockedProps = {
  title: 'title',
  body: <div>body</div>,
  onConfirm: jest.fn(),
  onCancel: jest.fn(),
  submitBtn: (
    <button type="button" data-testid="confirm-btn">
      Submit button
    </button>
  ),
  button: (
    <button type="button" data-testid="button">
      Button
    </button>
  ),
  onButtonClick: jest.fn(),
}

describe('ConfirmationPopover', () => {
  it('should render', () => {
    expect(render(<ConfirmationPopover {...mockedProps} />)).toBeTruthy()
  })

  it('should open confirmation message', async () => {
    render(<ConfirmationPopover {...mockedProps} />)

    expect(screen.queryByTestId('confirm-btn')).not.toBeInTheDocument()

    await act(() => {
      fireEvent.click(screen.getByTestId('button'))
    })

    expect(screen.queryByTestId('confirm-btn')).toBeInTheDocument()
  })

  it('should call proper actions', async () => {
    render(<ConfirmationPopover {...mockedProps} />)

    await act(() => {
      fireEvent.click(screen.getByTestId('button'))
    })

    await act(() => {
      fireEvent.click(screen.getByTestId('confirm-btn'))
    })

    expect(mockedProps.onConfirm).toHaveBeenCalled()
  })

  it('should close confirmation message', async () => {
    render(<ConfirmationPopover {...mockedProps} />)

    await act(() => {
      fireEvent.click(screen.getByTestId('button'))
    })

    await act(() => {
      fireEvent.click(screen.getByTestId('confirm-btn'))
    })

    waitFor(() => {
      expect(screen.queryByTestId('confirm-btn')).not.toBeInTheDocument()
    })
  })

  it('should close confirmation message on outside click', async () => {
    render(<ConfirmationPopover {...mockedProps} />)

    await act(() => {
      fireEvent.click(screen.getByTestId('button'))
    })

    await act(() => {
      fireEvent.click(document)
    })

    waitFor(() => {
      expect(screen.queryByTestId('confirm-btn')).not.toBeInTheDocument()
    })
  })

  it('should truncate title', async () => {
    render(
      <ConfirmationPopover
        {...mockedProps}
        title="job1fjdsafdhsjalkfhdsjlafhdjksalhfjdsalgldkafhjdsalfdhsjaflkdsahjfdsalkfhdsa"
      />,
    )

    await act(() => {
      fireEvent.click(screen.getByTestId('button'))
    })

    expect(
      screen.getByText(
        'job1fjdsafdhsjalkfhdsjlafhdjksalhfjdsalgldkafhjdsalfdhs...',
      ),
    ).toBeInTheDocument()
  })
})
