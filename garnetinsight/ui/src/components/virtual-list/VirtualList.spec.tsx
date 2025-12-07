import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import VirtualGrid, { Props } from './VirtualList'

const mockedProps = mock<Props>()

describe('VirtualList', () => {
  it('should render', () => {
    expect(render(<VirtualGrid {...instance(mockedProps)} />)).toBeTruthy()
  })
  it('should render with empty rows', () => {
    expect(
      render(<VirtualGrid {...instance(mockedProps)} items={[]} />),
    ).toBeTruthy()
  })
})
