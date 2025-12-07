import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import { Props, RemoveItemsAction } from './RemoveItemsAction'

const mockedProps = mock<Props>()

describe('RemoveItemsAction', () => {
  it('should render', () => {
    expect(
      render(<RemoveItemsAction {...instance(mockedProps)} />),
    ).toBeTruthy()
  })
})
