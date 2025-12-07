import React from 'react'
import { instance, mock } from 'ts-mockito'
import { fireEvent, screen, render } from 'uiSrc/utils/test-utils'
import ActionBar, { Props } from './ActionBar'

const mockedProps = mock<Props>()

describe('ActionBar', () => {
  it('should render', () => {
    expect(render(<ActionBar {...instance(mockedProps)} />)).toBeTruthy()
  })

  it('should call "onCloseActionBar"', () => {
    const handleClick = jest.fn()

    const renderer = render(
      <ActionBar {...instance(mockedProps)} onCloseActionBar={handleClick} />,
    )

    expect(renderer).toBeTruthy()

    fireEvent.click(screen.getByTestId('cancel-selecting'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
