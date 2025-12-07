import React from 'react'
import { instance, mock } from 'ts-mockito'

import { render } from 'uiSrc/utils/test-utils'
import EmptyMessage, { Props } from './EmptyMessage'

const mockedProps = mock<Props>()

describe('EmptyMessage', () => {
  it('should render', () => {
    expect(render(<EmptyMessage {...instance(mockedProps)} />)).toBeTruthy()
  })
})
