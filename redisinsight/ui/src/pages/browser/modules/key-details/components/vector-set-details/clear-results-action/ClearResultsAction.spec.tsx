import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import { MIDDLE_SCREEN_RESOLUTION } from 'uiSrc/constants'
import { ClearResultsAction } from './ClearResultsAction'
import { Props } from './ClearResultsAction.types'
import { BASE_TEST_ID } from './constants'

const renderComponent = (propsOverride: Partial<Props> = {}) => {
  const props: Props = {
    width: MIDDLE_SCREEN_RESOLUTION + 1,
    onClick: jest.fn(),
    ...propsOverride,
  }
  return { props, ...render(<ClearResultsAction {...props} />) }
}

describe('ClearResultsAction', () => {
  it('renders the button with the default title above the breakpoint', () => {
    renderComponent({ width: MIDDLE_SCREEN_RESOLUTION + 50 })

    const btn = screen.getByTestId(BASE_TEST_ID)
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveTextContent('Clear results')
  })

  it('renders the icon-only button below the breakpoint', () => {
    renderComponent({ width: MIDDLE_SCREEN_RESOLUTION - 1 })

    expect(screen.getByTestId(BASE_TEST_ID)).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = jest.fn()
    renderComponent({ onClick })

    fireEvent.click(screen.getByTestId(BASE_TEST_ID))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('respects a custom title override', () => {
    renderComponent({
      width: MIDDLE_SCREEN_RESOLUTION + 50,
      title: 'Wipe results',
    })

    expect(screen.getByTestId(BASE_TEST_ID)).toHaveTextContent('Wipe results')
  })

  it('prefixes the test id when testIdPrefix is provided', () => {
    renderComponent({ testIdPrefix: 'similarity-search' })

    expect(
      screen.getByTestId(`similarity-search-${BASE_TEST_ID}`),
    ).toBeInTheDocument()
    expect(screen.queryByTestId(BASE_TEST_ID)).not.toBeInTheDocument()
  })
})
