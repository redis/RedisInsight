import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import { Props, StreamItemsAction } from './StreamItemsAction'

const mockedProps = mock<Props>()

describe('StreamItemsAction', () => {
  it('should render', () => {
    expect(
      render(<StreamItemsAction {...instance(mockedProps)} />),
    ).toBeTruthy()
  })
})
