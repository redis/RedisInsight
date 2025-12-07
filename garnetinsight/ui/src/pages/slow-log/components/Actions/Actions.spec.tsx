import React from 'react'
import { mock } from 'ts-mockito'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import Actions, { Props } from './Actions'

const mockedProps = mock<Props>()

describe('Actions', () => {
  it('should render', () => {
    expect(render(<Actions {...mockedProps} />)).toBeTruthy()
  })

  it('should call onClear after submit clear btn', () => {
    const onClear = jest.fn()
    render(
      <Actions {...mockedProps} onClear={onClear} isEmptySlowLog={false} />,
    )

    fireEvent.click(screen.getByTestId('clear-btn'))
    fireEvent.click(screen.getByTestId('reset-confirm-btn'))

    expect(onClear).toBeCalled()
  })

  it('should call onRefresh after submit refresh btn', () => {
    const onRefresh = jest.fn()
    render(
      <Actions {...mockedProps} onRefresh={onRefresh} isEmptySlowLog={false} />,
    )

    fireEvent.click(screen.getByTestId('slowlog-refresh-btn'))

    expect(onRefresh).toBeCalled()
  })
})
