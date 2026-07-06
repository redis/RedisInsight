import React from 'react'
import { mock } from 'ts-mockito'
import { render, screen } from 'uiSrc/utils/test-utils'

import StreamEntryFields, { Props } from './StreamEntryFields'

const mockedProps = mock<Props>()

describe('StreamEntryFields', () => {
  it('should render', () => {
    expect(
      render(<StreamEntryFields {...mockedProps} fields={[]} />),
    ).toBeTruthy()
  })

  it('renders the Entry ID label with the required asterisk in front', () => {
    render(<StreamEntryFields {...mockedProps} fields={[]} />)

    const label = screen.getByText('Entry ID').closest('label')
    expect(label).toHaveTextContent('Entry ID')
    expect(label?.textContent?.trimStart().startsWith('*')).toBe(true)
  })
})
