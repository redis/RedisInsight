import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import CloudConnectionFormWrapper, { Props } from './CloudConnectionFormWrapper'

const mockedProps = mock<Props>()

describe('CloudConnectionFormWrapper', () => {
  it('should render', () => {
    expect(
      render(<CloudConnectionFormWrapper {...instance(mockedProps)} />),
    ).toBeTruthy()
  })
})
