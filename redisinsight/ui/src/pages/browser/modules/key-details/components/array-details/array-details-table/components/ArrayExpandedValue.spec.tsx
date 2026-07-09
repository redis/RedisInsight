import React from 'react'
import { cloneDeep } from 'lodash'
import {
  initialStateDefault,
  mockStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import { KeyValueFormat } from 'uiSrc/constants'
import { stringToBuffer } from 'uiSrc/utils'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'

import { ArrayExpandedValue } from './ArrayExpandedValue'

const renderExpanded = (
  value: RedisResponseBuffer,
  viewFormat: KeyValueFormat,
) => {
  const state = cloneDeep(initialStateDefault)
  state.browser.keys.selectedKey.viewFormat = viewFormat
  return render(<ArrayExpandedValue index="7" value={value} />, {
    store: mockStore(state),
  })
}

describe('ArrayExpandedValue', () => {
  it('routes a Markdown-format value through the markdown viewer', () => {
    renderExpanded(stringToBuffer('# Heading'), KeyValueFormat.Markdown)

    // The expanded value is handed to MarkdownViewer (its container), not the
    // plain-text branch. The unified pipeline is stubbed in jsdom, so the rich
    // HTML render itself is covered by the e2e / live verification.
    expect(screen.getByTestId('array-expanded-value-7')).toBeInTheDocument()
    expect(screen.getByTestId('markdown-viewer')).toBeInTheDocument()
  })

  it('renders the full text for a Unicode-format value', () => {
    renderExpanded(
      stringToBuffer('first line\nsecond line'),
      KeyValueFormat.Unicode,
    )

    const container = screen.getByTestId('array-expanded-value-7')
    expect(container).toHaveTextContent('first line')
    expect(container).toHaveTextContent('second line')
    // Plain text must not go through the markdown/JSON rich viewers.
    expect(screen.queryByTestId('markdown-viewer')).not.toBeInTheDocument()
    expect(screen.queryByTestId('value-as-json')).not.toBeInTheDocument()
  })

  it('renders the JSON tree for a JSON-format value', () => {
    renderExpanded(stringToBuffer('{"name":"redis"}'), KeyValueFormat.JSON)

    expect(screen.getByTestId('array-expanded-value-7')).toBeInTheDocument()
    expect(screen.getByTestId('value-as-json')).toBeInTheDocument()
  })
})
