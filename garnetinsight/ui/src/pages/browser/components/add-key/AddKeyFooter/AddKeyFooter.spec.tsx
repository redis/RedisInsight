import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import AddKeyFooter, { Props } from './AddKeyFooter'

const mockedProps = mock<Props>()

describe('AddKeyFooter', () => {
  it('should render', () => {
    expect(render(<AddKeyFooter {...instance(mockedProps)} />)).toBeTruthy()
  })
})
