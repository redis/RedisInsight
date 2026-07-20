import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import Divider from './Divider'
import { DividerProps } from './Divider.types'

const mockedProps = mock<DividerProps>()

describe('Divider', () => {
  it('should render', () => {
    expect(render(<Divider {...instance(mockedProps)} />)).toBeTruthy()
  })
})
