import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render } from 'uiSrc/utils/test-utils'

import Table, { Props } from './TopNamespacesTable'

const mockedProps = mock<Props>()

describe('Top Namespaces Table', () => {
  it('should render', () => {
    expect(render(<Table {...instance(mockedProps)} />)).toBeTruthy()
  })
})
