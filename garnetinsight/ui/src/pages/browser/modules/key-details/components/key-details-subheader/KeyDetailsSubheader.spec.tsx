import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import { KeyDetailsSubheader, Props } from './KeyDetailsSubheader'

const mockedProps = mock<Props>()

describe('KeyDetailsSubheader', () => {
  it('should render', () => {
    expect(
      render(<KeyDetailsSubheader {...instance(mockedProps)} />),
    ).toBeTruthy()
  })
})
