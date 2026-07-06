import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import AddMultipleFields from './AddMultipleFields'

const testItems1 = [{ id: '0', field: '' }]

describe('AddMultipleFields', () => {
  it('should render', () => {
    expect(
      render(
        <AddMultipleFields
          items={testItems1}
          isClearDisabled={() => false}
          onClickAdd={jest.fn()}
          onClickRemove={jest.fn()}
        >
          {() => <div />}
        </AddMultipleFields>,
      ),
    ).toBeTruthy()
  })

  it('renders column headers once, with the required asterisk in front', () => {
    render(
      <AddMultipleFields
        items={testItems1}
        isClearDisabled={() => true}
        onClickAdd={jest.fn()}
        onClickRemove={jest.fn()}
        columnLabels={[{ label: 'Member' }, { label: 'Score', required: true }]}
      >
        {() => <div />}
      </AddMultipleFields>,
    )

    const score = screen.getByText('Score').closest('label')
    expect(score?.textContent?.trimStart().startsWith('*')).toBe(true)

    // A non-required column shows no leading asterisk.
    const member = screen.getByText('Member').closest('label')
    expect(member?.textContent?.trimStart().startsWith('*')).toBe(false)
  })
})
