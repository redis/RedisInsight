import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'
import { Props, EditItemAction } from './EditItemAction'

const mockedProps = mock<Props>()

describe('EditItemAction', () => {
  it('should render', () => {
    expect(render(<EditItemAction {...instance(mockedProps)} />)).toBeTruthy()
  })
})
