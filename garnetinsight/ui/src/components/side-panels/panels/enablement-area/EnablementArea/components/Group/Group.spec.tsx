import React from 'react'
import { instance, mock } from 'ts-mockito'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import Group, { Props } from './Group'

const mockedProps = mock<Props>()
const testId = 'quick-guides'

describe('Group', () => {
  it('should render', () => {
    expect(
      render(<Group {...instance(mockedProps)} id={testId} />),
    ).toBeTruthy()
  })
  it('should correctly render content', () => {
    const label = 'Quick Guides'
    const children = [
      <span key="item-1">Item 1</span>,
      <span key="item-2">Item 2</span>,
    ]
    const { queryByTestId } = render(
      <Group {...instance(mockedProps)} id={testId} label={label}>
        {children}
      </Group>,
    )
    const accordionButton = queryByTestId(`accordion-${testId}`)

    expect(accordionButton).toHaveTextContent(label)
  })
  it('should emit onToggle', () => {
    const callback = jest.fn()
    const label = 'Quick Guides'

    render(
      <Group
        {...instance(mockedProps)}
        id={testId}
        label={label}
        onToggle={callback}
      />,
    )
    const accordion = screen.getByTestId(`accordion-${testId}`)
    const btn = accordion.querySelector('button')
    fireEvent.click(btn!)

    expect(callback).toHaveBeenCalled()
  })
})
