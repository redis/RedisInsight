import React from 'react'
import { mock } from 'ts-mockito'
import { render, screen } from 'uiSrc/utils/test-utils'

import FormattedValue, { Props } from './FormattedValue'

const mockedProps = mock<Props>()

describe('FormattedValue', () => {
  it('should render', () => {
    expect(
      render(<FormattedValue {...mockedProps} value="Some string" />),
    ).toBeTruthy()
  })

  it('should display text provided in a props', () => {
    const value = 'Some string'
    render(<FormattedValue {...mockedProps} value={value} />)
    expect(screen.getAllByText(value).length).toEqual(1)
  })
})
