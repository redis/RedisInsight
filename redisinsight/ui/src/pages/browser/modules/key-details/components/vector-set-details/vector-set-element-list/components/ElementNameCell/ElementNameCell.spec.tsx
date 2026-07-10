import React from 'react'

import { render, screen } from 'uiSrc/utils/test-utils'
import { KeyValueFormat } from 'uiSrc/constants'
import { stringToBuffer } from 'uiSrc/utils'
import { ElementNameCell } from './ElementNameCell'

const element = { name: stringToBuffer('element-abc') }

describe('ElementNameCell', () => {
  it('builds the test id from the raw name', () => {
    render(
      <ElementNameCell
        element={element}
        compressor={null}
        viewFormat={KeyValueFormat.Unicode}
      />,
    )

    expect(
      screen.getByTestId('vector-set-element-value-element-abc'),
    ).toBeInTheDocument()
  })

  it('keeps the raw-name test id when the format renders JSX', () => {
    render(
      <ElementNameCell
        element={element}
        compressor={null}
        viewFormat={KeyValueFormat.Markdown}
      />,
    )

    expect(
      screen.getByTestId('vector-set-element-value-element-abc'),
    ).toBeInTheDocument()
  })
})
