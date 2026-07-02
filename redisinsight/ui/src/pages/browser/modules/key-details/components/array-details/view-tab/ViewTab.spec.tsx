import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { stringToBuffer } from 'uiSrc/utils'

import ViewTab from './ViewTab'
import { useArrayRangeQuery } from '../hooks'

jest.mock('../hooks', () => ({
  ...jest.requireActual('../hooks'),
  useArrayRangeQuery: jest.fn(),
}))

const keyA = stringToBuffer('key-a')
const keyB = stringToBuffer('key-b')

const ADD_BTN = 'add-key-value-items-btn'
const PANEL = 'array-add-form'

const mockRangeQuery = (overrides = {}) =>
  (useArrayRangeQuery as jest.Mock).mockReturnValue({
    start: '0',
    end: '9',
    showEmpty: true,
    setStart: jest.fn(),
    setEnd: jest.fn(),
    setShowEmpty: jest.fn(),
    runQuery: jest.fn(),
    resetQuery: jest.fn(),
    isArrayKeyReady: true,
    elements: [],
    loading: false,
    error: '',
    ...overrides,
  })

describe('ViewTab', () => {
  beforeEach(() => {
    mockRangeQuery()
  })

  it('opens the add panel and fires open telemetry', () => {
    const onOpenAddItemPanel = jest.fn()
    render(<ViewTab keyProp={keyA} onOpenAddItemPanel={onOpenAddItemPanel} />)

    expect(screen.queryByTestId(PANEL)).not.toBeInTheDocument()
    fireEvent.click(screen.getByTestId(ADD_BTN))

    expect(onOpenAddItemPanel).toHaveBeenCalled()
    expect(screen.getByTestId(PANEL)).toBeInTheDocument()
  })

  it('fires cancel telemetry and hides the panel on Cancel', () => {
    const onCloseAddItemPanel = jest.fn()
    render(<ViewTab keyProp={keyA} onCloseAddItemPanel={onCloseAddItemPanel} />)

    fireEvent.click(screen.getByTestId(ADD_BTN))
    fireEvent.click(screen.getByTestId(`${PANEL}-cancel`))

    expect(onCloseAddItemPanel).toHaveBeenCalled()
    expect(screen.queryByTestId(PANEL)).not.toBeInTheDocument()
  })

  it('closes the panel when the selected key changes', () => {
    const { rerender } = render(<ViewTab keyProp={keyA} />)

    fireEvent.click(screen.getByTestId(ADD_BTN))
    expect(screen.getByTestId(PANEL)).toBeInTheDocument()

    rerender(<ViewTab keyProp={keyB} />)
    expect(screen.queryByTestId(PANEL)).not.toBeInTheDocument()
  })

  it('keeps the panel open when keyProp is a new buffer with the same bytes', () => {
    const { rerender } = render(<ViewTab keyProp={keyA} />)

    fireEvent.click(screen.getByTestId(ADD_BTN))
    expect(screen.getByTestId(PANEL)).toBeInTheDocument()

    // Same key, fresh buffer object — a byte-exact compare must not close it.
    rerender(<ViewTab keyProp={stringToBuffer('key-a')} />)
    expect(screen.getByTestId(PANEL)).toBeInTheDocument()
  })
})
