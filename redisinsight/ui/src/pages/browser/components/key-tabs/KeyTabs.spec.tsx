import React from 'react'
import { cloneDeep, set } from 'lodash'
import { faker } from '@faker-js/faker'

import {
  fireEvent,
  initialStateDefault,
  mockStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import { anyToBuffer, stringToBuffer } from 'uiSrc/utils'
import { KeyValueFormat } from 'uiSrc/constants'
import {
  KeyTab,
  KeyTabRemovedReason,
  RedisResponseBuffer,
} from 'uiSrc/slices/interfaces'

import { KeyTabs, KeyTabsProps } from './KeyTabs'

const MIDDLE_MOUSE_BUTTON = 1

const keyNames = faker.helpers.uniqueArray(
  () => faker.string.alphanumeric(10),
  3,
)
const keys = keyNames.map((name) => stringToBuffer(name))
const toTab = (
  key: RedisResponseBuffer,
  removedReason: KeyTab['removedReason'] = null,
): KeyTab => ({ key, expiresAt: null, removedReason })

describe('KeyTabs', () => {
  const defaultProps: KeyTabsProps = {
    tabs: keys.map((key) => toTab(key)),
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

  it('should move focus through the tablist with keyboard navigation', () => {
    renderComponent()
    const tabs = screen.getAllByRole('tab')

    tabs[0].focus()
    fireEvent.keyDown(tabs[0], { key: 'ArrowRight' })
    expect(document.activeElement).toBe(tabs[1])

    fireEvent.keyDown(tabs[1], { key: 'End' })
    expect(document.activeElement).toBe(tabs[2])
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

  it('should format tab names with the HEX key name format', () => {
    const state = cloneDeep(initialStateDefault)
    set(
      state,
      'connections.instances.connectedInstance.keyNameFormat',
      KeyValueFormat.HEX,
    )
    // binary keys that both decode to the replacement character as UTF-8
    const binaryKeys = [anyToBuffer([0x80]), anyToBuffer([0x81])]

    render(
      <KeyTabs
        {...defaultProps}
        tabs={binaryKeys.map((key) => toTab(key))}
        activeKey={binaryKeys[0]}
      />,
      { store: mockStore(state) },
    )

    expect(screen.getByTestId('key-tab-80')).toHaveTextContent('80')
    expect(screen.getByTestId('key-tab-81')).toHaveTextContent('81')
  })

  it('should label tabs of keys that are no longer found', () => {
    renderComponent({
      tabs: [
        toTab(keys[0], KeyTabRemovedReason.NotFound),
        toTab(keys[1], KeyTabRemovedReason.NotFound),
        toTab(keys[2]),
      ],
    })

    expect(
      screen.getByTestId(`key-tab-not-found-${keyNames[0]}`),
    ).toHaveTextContent('Not found')
    expect(
      screen.getByTestId(`key-tab-not-found-${keyNames[1]}`),
    ).toHaveTextContent('Not found')
    expect(screen.getByTestId(`key-tab-${keyNames[2]}`)).not.toHaveTextContent(
      /Deleted|Expired/,
    )
  })

  it('should keep a removed key tab selectable and closable', () => {
    renderComponent({
      tabs: [toTab(keys[0], KeyTabRemovedReason.NotFound)],
    })

    fireEvent.click(screen.getByTestId(`key-tab-${keyNames[0]}`))
    fireEvent.click(screen.getByTestId(`close-key-tab-${keyNames[0]}`))

    expect(defaultProps.onSelectTab).toHaveBeenCalledWith(keys[0])
    expect(defaultProps.onCloseTab).toHaveBeenCalledWith(keys[0])
  })
})
