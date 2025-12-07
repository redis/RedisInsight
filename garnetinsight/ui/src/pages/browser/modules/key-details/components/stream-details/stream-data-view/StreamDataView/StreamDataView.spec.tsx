import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import StreamDataView, { Props } from './StreamDataView'

const mockedProps = mock<Props>()

describe('StreamDataView', () => {
  it('should render', () => {
    expect(render(<StreamDataView {...instance(mockedProps)} />)).toBeTruthy()
  })
})
