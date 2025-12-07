import React from 'react'
import { mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'

import StreamEntryFields, { Props } from './StreamEntryFields'

const mockedProps = mock<Props>()

describe('StreamEntryFields', () => {
  it('should render', () => {
    expect(
      render(<StreamEntryFields {...mockedProps} fields={[]} />),
    ).toBeTruthy()
  })
})
