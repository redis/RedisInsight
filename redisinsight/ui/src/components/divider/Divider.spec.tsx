import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import Divider, { DividerProps } from './Divider'

const mockedProps = mock<DividerProps>()

describe('Divider', () => {
  it('should render', () => {
    expect(render(<Divider {...instance(mockedProps)} />)).toBeTruthy()
  })
})
