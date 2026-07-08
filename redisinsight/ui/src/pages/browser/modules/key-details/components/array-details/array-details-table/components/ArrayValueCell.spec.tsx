import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { stringToBuffer } from 'uiSrc/utils'
import { KeyValueFormat } from 'uiSrc/constants'
import { getConfig } from 'uiSrc/config'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'

import { ArrayValueCell } from './ArrayValueCell'

const { truncatedStringPrefix } = getConfig().app

const renderCell = (props: Record<string, unknown> = {}) =>
  render(
    <ArrayValueCell
      index="1"
      value={stringToBuffer('foo')}
      compressor={null}
      viewFormat={KeyValueFormat.Unicode}
      isEditing
      onEdit={jest.fn()}
      onApply={jest.fn()}
      {...props}
    />,
  )

describe('ArrayValueCell — open editor Save lock', () => {
  it('enables Save when no write/read is in flight', () => {
    renderCell({ updating: false, loading: false })
    expect(screen.getByTestId('apply-btn')).not.toBeDisabled()
  })

  it('disables Save while a patched-view read is in flight', () => {
    // A range/scan/search read that started just before the refresh-disabled
    // flag took effect must not be Saved into — its success would overwrite the
    // optimistic patch.
    renderCell({ updating: false, loading: true })
    expect(screen.getByTestId('apply-btn')).toBeDisabled()
  })

  it('disables Save while an ARSET write is in flight', () => {
    renderCell({ updating: true, loading: false })
    expect(screen.getByTestId('apply-btn')).toBeDisabled()
  })
})

describe('ArrayValueCell — inline value rendering', () => {
  it('renders Markdown values as rich markdown directly in the cell', () => {
    renderCell({
      isEditing: false,
      viewFormat: KeyValueFormat.Markdown,
      value: stringToBuffer('# Title'),
    })
    expect(screen.getByTestId('markdown-viewer')).toBeInTheDocument()
  })

  it('keeps non-Markdown formats compact without a markdown viewer', () => {
    renderCell({
      isEditing: false,
      viewFormat: KeyValueFormat.JSON,
      value: stringToBuffer('{"a":1}'),
    })
    expect(screen.queryByTestId('markdown-viewer')).not.toBeInTheDocument()
    expect(
      screen.getByTestId('array-details-table-value-1'),
    ).toBeInTheDocument()
  })
})

jest.mock('uiSrc/components/base/code-editor', () => {
  const ReactMock = require('react')
  return {
    __esModule: true,
    CodeEditor: (props: any) =>
      ReactMock.createElement('textarea', {
        'data-testid': 'array-value-code-editor',
        value: props.value,
        onChange: (e: any) => props.onChange?.(e.target.value),
      }),
  }
})

// Auto-confirm the production-write prompt so Save reaches onApply in tests.
jest.mock('uiSrc/components/production-write-confirmation', () => ({
  __esModule: true,
  useProductionWriteConfirmation: () => ({
    requestConfirmation: ({ onConfirm }: any) => onConfirm(),
  }),
  BrowserConfirmationCommandId: { EditValue: 'EditValue' },
}))

const TEST_ID_PREFIX = 'array-details-table'

const baseProps = {
  index: '0',
  value: stringToBuffer('hello'),
  compressor: null,
  viewFormat: KeyValueFormat.Unicode,
}

describe('ArrayValueCell — expand trigger + modal', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders an expand trigger that opens the modal seeded with the value', () => {
    render(
      <ArrayValueCell {...baseProps} onEdit={jest.fn()} onApply={jest.fn()} />,
    )

    fireEvent.mouseEnter(
      screen.getByTestId(`${TEST_ID_PREFIX}_content-value-0`),
    )
    fireEvent.click(screen.getByTestId(`${TEST_ID_PREFIX}_expand-btn-0`))

    expect(screen.getByTestId('array-value-code-editor')).toHaveValue('hello')
  })

  it('Save calls onApply with the edited value', () => {
    const onApply = jest.fn()
    render(
      <ArrayValueCell {...baseProps} onEdit={jest.fn()} onApply={onApply} />,
    )

    fireEvent.mouseEnter(
      screen.getByTestId(`${TEST_ID_PREFIX}_content-value-0`),
    )
    fireEvent.click(screen.getByTestId(`${TEST_ID_PREFIX}_expand-btn-0`))
    fireEvent.change(screen.getByTestId('array-value-code-editor'), {
      target: { value: 'world' },
    })
    fireEvent.click(screen.getByTestId('array-value-editor-save-btn'))

    expect(onApply).toHaveBeenCalledWith('world')
  })

  it('renders no expand trigger for an empty slot', () => {
    render(
      <ArrayValueCell
        {...baseProps}
        value={null as unknown as RedisResponseBuffer}
        onEdit={jest.fn()}
        onApply={jest.fn()}
      />,
    )

    expect(screen.getByTestId(`${TEST_ID_PREFIX}-empty-0`)).toBeInTheDocument()
    expect(
      screen.queryByTestId(`${TEST_ID_PREFIX}_expand-btn-0`),
    ).not.toBeInTheDocument()
  })

  it('renders no expand trigger when onApply is not wired (read-only context, e.g. search neighbours band)', () => {
    render(<ArrayValueCell {...baseProps} onEdit={jest.fn()} />)

    fireEvent.mouseEnter(
      screen.getByTestId(`${TEST_ID_PREFIX}_content-value-0`),
    )

    expect(
      screen.queryByTestId(`${TEST_ID_PREFIX}_expand-btn-0`),
    ).not.toBeInTheDocument()
  })

  it('disables the expand trigger while a write is in flight', () => {
    render(
      <ArrayValueCell
        {...baseProps}
        updating
        onEdit={jest.fn()}
        onApply={jest.fn()}
      />,
    )

    fireEvent.mouseEnter(
      screen.getByTestId(`${TEST_ID_PREFIX}_content-value-0`),
    )

    expect(screen.getByTestId(`${TEST_ID_PREFIX}_expand-btn-0`)).toBeDisabled()
  })

  it('disables editing for a backend-truncated value so a truncated copy cannot be saved back', () => {
    render(
      <ArrayValueCell
        {...baseProps}
        value={stringToBuffer(`${truncatedStringPrefix} big value…`)}
        onEdit={jest.fn()}
        onApply={jest.fn()}
      />,
    )

    fireEvent.mouseEnter(
      screen.getByTestId(`${TEST_ID_PREFIX}_content-value-0`),
    )

    expect(screen.getByTestId(`${TEST_ID_PREFIX}_expand-btn-0`)).toBeDisabled()
    expect(screen.getByTestId(`${TEST_ID_PREFIX}_edit-btn-0`)).toBeDisabled()
  })
})
