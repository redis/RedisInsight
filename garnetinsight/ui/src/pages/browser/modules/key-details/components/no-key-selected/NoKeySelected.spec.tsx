import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import { Props, NoKeySelected } from './NoKeySelected'

const mockedProps = mock<Props>()

describe('NoKeySelected', () => {
  it('should render', () => {
    expect(render(<NoKeySelected {...instance(mockedProps)} />)).toBeTruthy()
  })
})
