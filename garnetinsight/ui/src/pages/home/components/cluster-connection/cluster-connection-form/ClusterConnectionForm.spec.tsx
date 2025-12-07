import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import ClusterConnectionForm, { Props } from './ClusterConnectionForm'

const mockedProps = mock<Props>()

describe('ClusterConnectionForm', () => {
  it('should render', () => {
    expect(
      render(<ClusterConnectionForm {...instance(mockedProps)} />),
    ).toBeTruthy()
  })
})
