import React from 'react'
import { faker } from '@faker-js/faker'

import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { stringToBuffer } from 'uiSrc/utils'

import { KeyTabs, KeyTabsProps } from './KeyTabs'

const MIDDLE_MOUSE_BUTTON = 1

const keyNames = faker.helpers.uniqueArray(
  () => faker.string.alphanumeric(10),
  3,
)
const keys = keyNames.map((name) => stringToBuffer(name))

describe('KeyTabs', () => {
  const defaultProps: KeyTabsProps = {
    tabs: keys,
    activeKey: keys[1],
    onSelectTab: jest.fn(),
    onCloseTab: jest.fn(),
  }

  const renderComponent = (propsOverride?: Partial<KeyTabsProps>) =>
    render(<KeyTabs {...defaultProps} {...propsOverride} />)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render a tab for every opened key', () => {
    renderComponent()

    expect(screen.getAllByRole('tab')).toHaveLength(keyNames.length)
    keyNames.forEach((name) => {
      expect(screen.getByTestId(`key-tab-${name}`)).toHaveTextContent(name)
    })
  })

  it('should render nothing when there are no tabs', () => {
    renderComponent({ tabs: [] })

    expect(screen.queryByTestId('key-tabs')).not.toBeInTheDocument()
  })

  it('should mark only the active key tab as selected', () => {
    renderComponent()

    expect(screen.getByTestId(`key-tab-${keyNames[1]}`)).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByTestId(`key-tab-${keyNames[0]}`)).toHaveAttribute(
      'aria-selected',
      'false',
    )
  })

  it('should not mark any tab as selected when there is no active key', () => {
    renderComponent({ activeKey: null })

    screen.getAllByRole('tab').forEach((tab) => {
      expect(tab).toHaveAttribute('aria-selected', 'false')
    })
  })

  it('should call onSelectTab when a tab is clicked', () => {
    renderComponent()

    fireEvent.click(screen.getByTestId(`key-tab-${keyNames[2]}`))

    expect(defaultProps.onSelectTab).toHaveBeenCalledWith(keys[2])
    expect(defaultProps.onCloseTab).not.toHaveBeenCalled()
  })

  it('should call onSelectTab when Enter is pressed on a tab', () => {
    renderComponent()

    fireEvent.keyDown(screen.getByTestId(`key-tab-${keyNames[0]}`), {
      key: 'Enter',
    })

    expect(defaultProps.onSelectTab).toHaveBeenCalledWith(keys[0])
  })

  it('should call only onCloseTab when the close button is clicked', () => {
    renderComponent()

    fireEvent.click(screen.getByTestId(`close-key-tab-${keyNames[0]}`))

    expect(defaultProps.onCloseTab).toHaveBeenCalledWith(keys[0])
    expect(defaultProps.onSelectTab).not.toHaveBeenCalled()
  })

  it('should call onCloseTab on middle click', () => {
    renderComponent()

    fireEvent.mouseUp(screen.getByTestId(`key-tab-${keyNames[2]}`), {
      button: MIDDLE_MOUSE_BUTTON,
    })

    expect(defaultProps.onCloseTab).toHaveBeenCalledWith(keys[2])
  })
})
