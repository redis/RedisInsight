import React from 'react'
import { instance, mock } from 'ts-mockito'
import { act } from '@testing-library/react'
import { anyToBuffer } from 'uiSrc/utils'
import {
  render,
  screen,
  fireEvent,
  waitForRiTooltipVisible,
} from 'uiSrc/utils/test-utils'
import { MOCK_TRUNCATED_STRING_VALUE } from 'uiSrc/mocks/data/bigString'
import { TEXT_DISABLED_ACTION_WITH_TRUNCATED_DATA } from 'uiSrc/constants'
import PopoverDelete, { Props } from './PopoverDelete'

const mockedProps = mock<Props>()

describe('PopoverDelete', () => {
  it('should render', () => {
    expect(render(<PopoverDelete {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should call showPopover on delete', () => {
    const showPopover = jest.fn()
    render(
      <PopoverDelete
        {...instance(mockedProps)}
        item="name"
        showPopover={showPopover}
      />,
    )
    fireEvent.click(screen.getByLabelText(/remove field/i))

    expect(showPopover).toBeCalledTimes(1)
  })

  it('should disable delete button for truncated strings', async () => {
    const showPopover = jest.fn()
    render(
      <PopoverDelete
        {...instance(mockedProps)}
        item={MOCK_TRUNCATED_STRING_VALUE}
        showPopover={showPopover}
      />,
    )
    fireEvent.click(screen.getByLabelText(/remove field/i))

    expect(showPopover).toBeCalledTimes(0)

    const removeButton = screen.getByTestId('remove-icon')

    expect(removeButton).toBeDisabled()

    await act(async () => {
      fireEvent.focus(removeButton)
    })
    await waitForRiTooltipVisible()

    expect(screen.getByTestId('remove-tooltip')).toHaveTextContent(
      TEXT_DISABLED_ACTION_WITH_TRUNCATED_DATA,
    )
  })

  it('should call handleDeleteItem on delete', () => {
    const handleDeleteItem = jest.fn()
    render(
      <PopoverDelete
        {...instance(mockedProps)}
        item="name"
        suffix="_"
        deleting="name_"
        handleDeleteItem={handleDeleteItem}
      />,
    )

    const deleteBtn = screen.getByTestId('remove')
    fireEvent.click(deleteBtn)
    expect(handleDeleteItem).toBeCalledTimes(1)
  })

  it('should call handleDeleteItem on delete with itemRaw prop', () => {
    const itemRawMock = anyToBuffer([1, 2, 3])
    const handleDeleteItem = jest.fn()
    render(
      <PopoverDelete
        {...instance(mockedProps)}
        item="name"
        itemRaw={itemRawMock}
        suffix="_"
        deleting="name_"
        handleDeleteItem={handleDeleteItem}
      />,
    )

    const deleteBtn = screen.getByTestId('remove')
    fireEvent.click(deleteBtn)
    expect(handleDeleteItem).toBeCalledTimes(1)
    expect(handleDeleteItem).toBeCalledWith(itemRawMock)
  })

  it('should call handleDeleteItem on delete with item prop if itemRaw is not defined', () => {
    const itemMock = 'name'
    const handleDeleteItem = jest.fn()
    render(
      <PopoverDelete
        {...instance(mockedProps)}
        item={itemMock}
        itemRaw={undefined}
        suffix="_"
        deleting="name_"
        handleDeleteItem={handleDeleteItem}
      />,
    )

    const deleteBtn = screen.getByTestId('remove')
    fireEvent.click(deleteBtn)
    expect(handleDeleteItem).toBeCalledTimes(1)
    expect(handleDeleteItem).toBeCalledWith(itemMock)
  })
})
