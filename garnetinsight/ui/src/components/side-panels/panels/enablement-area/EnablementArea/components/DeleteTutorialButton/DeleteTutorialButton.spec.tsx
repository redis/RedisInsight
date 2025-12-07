import React from 'react'
import { mock } from 'ts-mockito'
import { render, screen, fireEvent, act } from 'uiSrc/utils/test-utils'

import DeleteTutorialButton, { Props } from './DeleteTutorialButton'

const mockedProps = mock<Props>()

describe('DeleteTutorialButton', () => {
  it('should render', () => {
    expect(render(<DeleteTutorialButton {...mockedProps} />)).toBeTruthy()
  })

  it('should call onDelete', async () => {
    const onDelete = jest.fn()
    render(<DeleteTutorialButton {...mockedProps} onDelete={onDelete} id="1" />)

    await act(() => {
      fireEvent.click(screen.getByTestId('delete-tutorial-icon-1'))
    })

    fireEvent.click(screen.getByTestId('delete-tutorial-1'))

    expect(onDelete).toBeCalled()
  })
})
