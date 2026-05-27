import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { stringToBuffer } from 'uiSrc/utils'
import { KeyTypes } from 'uiSrc/constants'

import { Props, ArrayDetails } from './ArrayDetails'

jest.mock('uiSrc/slices/browser/keys', () => ({
  ...jest.requireActual('uiSrc/slices/browser/keys'),
  selectedKeySelector: jest.fn(),
  selectedKeyDataSelector: jest.fn(),
  setSelectedKeyRefreshDisabled: jest.fn(() => ({
    type: 'keys/setSelectedKeyRefreshDisabled',
  })),
}))

jest.mock('uiSrc/slices/browser/array', () => {
  const defaultState = jest.requireActual(
    'uiSrc/slices/browser/array',
  ).initialState
  return {
    ...jest.requireActual('uiSrc/slices/browser/array'),
    arraySelector: jest.fn().mockReturnValue(defaultState),
    arrayDataSelector: jest.fn().mockReturnValue(defaultState.data),
    addArrayElementsStateSelector: jest
      .fn()
      .mockReturnValue(defaultState.adding),
    addArrayElements: () => jest.fn(),
    fetchArrayElements: () => jest.fn(),
  }
})

const defaultProps: Props = {
  onRemoveKey: jest.fn(),
  onOpenAddItemPanel: jest.fn(),
  onCloseAddItemPanel: jest.fn(),
  onCloseKey: jest.fn(),
  onEditKey: jest.fn(),
  isFullScreen: false,
  arePanelsCollapsed: false,
  onToggleFullScreen: jest.fn(),
}

const renderComponent = (propsOverride?: Partial<Props>) =>
  render(<ArrayDetails {...defaultProps} {...propsOverride} />)

describe('ArrayDetails', () => {
  const { selectedKeySelector, selectedKeyDataSelector } = jest.requireMock(
    'uiSrc/slices/browser/keys',
  )

  beforeEach(() => {
    jest.clearAllMocks()
    selectedKeySelector.mockReturnValue({ loading: false, viewFormat: 'UTF-8' })
    selectedKeyDataSelector.mockReturnValue({
      name: stringToBuffer('myarray'),
      nameString: 'myarray',
      type: KeyTypes.Array,
      ttl: -1,
      size: 100,
      length: 0,
      nextInsertIndex: undefined,
    })
  })

  it('should render', () => {
    expect(renderComponent()).toBeTruthy()
  })

  it('should render key details header', () => {
    renderComponent()
    expect(screen.getByTestId('key-details-header')).toBeInTheDocument()
  })

  // AutoSizer reports width=0 in jsdom, so the component always renders the
  // compact form: "${total} / ${logicalLength}[· NII: X]"
  it('should render count summary element', () => {
    renderComponent()
    const summary = screen.getByTestId('array-count-summary')
    expect(summary).toBeInTheDocument()
    expect(summary.textContent).toMatch(/\d+ \/ \d+/)
  })

  it('should not show NII when nextInsertIndex is undefined', () => {
    renderComponent()
    const summary = screen.getByTestId('array-count-summary')
    expect(summary.textContent).not.toContain('NII')
  })

  it('should show NII when nextInsertIndex is provided', () => {
    selectedKeyDataSelector.mockReturnValue({
      name: stringToBuffer('myarray'),
      nameString: 'myarray',
      type: KeyTypes.Array,
      ttl: -1,
      size: 100,
      length: 0,
      nextInsertIndex: 3,
    })

    renderComponent()

    const summary = screen.getByTestId('array-count-summary')
    expect(summary.textContent).toContain('NII: 3')
  })

  it('should show NII: 0 when nextInsertIndex is 0', () => {
    selectedKeyDataSelector.mockReturnValue({
      name: stringToBuffer('myarray'),
      nameString: 'myarray',
      type: KeyTypes.Array,
      ttl: -1,
      size: 100,
      length: 0,
      nextInsertIndex: 0,
    })

    renderComponent()

    const summary = screen.getByTestId('array-count-summary')
    expect(summary.textContent).toContain('NII: 0')
  })

  it('should render Add Elements button', () => {
    renderComponent()
    expect(screen.getByTestId('add-key-value-items-btn')).toBeInTheDocument()
  })

  it('should open add element form when Add Elements is clicked', () => {
    renderComponent()

    expect(
      screen.queryByTestId('array-add-element-btn'),
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByTestId('add-key-value-items-btn'))

    expect(screen.getByTestId('array-add-element-btn')).toBeInTheDocument()
    expect(screen.getByTestId('cancel-array-elements-btn')).toBeInTheDocument()
  })

  it('should close add element form when Cancel is clicked', () => {
    renderComponent()

    fireEvent.click(screen.getByTestId('add-key-value-items-btn'))
    expect(screen.getByTestId('array-add-element-btn')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('cancel-array-elements-btn'))
    expect(
      screen.queryByTestId('array-add-element-btn'),
    ).not.toBeInTheDocument()
  })

  it('should call onOpenAddItemPanel when add panel is opened', () => {
    const onOpenAddItemPanel = jest.fn()
    renderComponent({ onOpenAddItemPanel })

    fireEvent.click(screen.getByTestId('add-key-value-items-btn'))
    expect(onOpenAddItemPanel).toHaveBeenCalledTimes(1)
  })

  it('should call onCloseAddItemPanel when add panel is closed', () => {
    const onCloseAddItemPanel = jest.fn()
    renderComponent({ onCloseAddItemPanel })

    fireEvent.click(screen.getByTestId('add-key-value-items-btn'))
    fireEvent.click(screen.getByTestId('cancel-array-elements-btn'))
    expect(onCloseAddItemPanel).toHaveBeenCalledTimes(1)
  })
})
