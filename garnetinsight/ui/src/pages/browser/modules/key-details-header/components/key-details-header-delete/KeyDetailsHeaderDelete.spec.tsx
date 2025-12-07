import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import { Props, KeyDetailsHeaderDelete } from './KeyDetailsHeaderDelete'

const mockedProps = mock<Props>()

describe('KeyDetailsHeaderDelete', () => {
  it('should render', () => {
    expect(
      render(<KeyDetailsHeaderDelete {...instance(mockedProps)} />),
    ).toBeTruthy()
  })
})
