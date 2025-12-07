import React from 'react'
import { render } from 'uiSrc/utils/test-utils'

import AddMultipleFields from './AddMultipleFields'

const testItems1 = [{ id: '0', field: '' }]
const testItems2 = [{ id: '0', field: '', value: '' }]
const testItems3 = [
  { id: '0', field: 'field', value: 'val' },
  { id: '1', field: '', value: '' },
]

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
})
