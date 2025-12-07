import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'

import MessageAckPopover, { Props } from './MessageAckPopover'

const mockedProps = mock<Props>()

describe('MessageAckPopover', () => {
  it('should render', () => {
    expect(
      render(<MessageAckPopover {...instance(mockedProps)} />),
    ).toBeTruthy()
  })
})
