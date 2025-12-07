import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import { Props, FullScreen } from './FullScreen'

const mockedProps = mock<Props>()

describe('FullScreen', () => {
  it('should render', () => {
    expect(render(<FullScreen {...instance(mockedProps)} />)).toBeTruthy()
  })
})
