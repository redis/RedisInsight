import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import { Props, AddItemsAction } from './AddItemsAction'

const mockedProps = mock<Props>()

describe('AddItemsAction', () => {
  it('should render', () => {
    expect(render(<AddItemsAction {...instance(mockedProps)} />)).toBeTruthy()
  })
})
