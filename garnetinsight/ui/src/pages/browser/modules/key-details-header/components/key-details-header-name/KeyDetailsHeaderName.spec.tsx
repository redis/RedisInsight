import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import { Props, KeyDetailsHeaderName } from './KeyDetailsHeaderName'

const mockedProps = mock<Props>()

describe('KeyDetailsHeaderName', () => {
  it('should render', () => {
    expect(
      render(<KeyDetailsHeaderName {...instance(mockedProps)} />),
    ).toBeTruthy()
  })
})
