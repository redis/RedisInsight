import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'
import { stringToBuffer } from 'uiSrc/utils'
import { KeyValueFormat } from 'uiSrc/constants'

import { ArrayValueCell } from './ArrayValueCell'

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
