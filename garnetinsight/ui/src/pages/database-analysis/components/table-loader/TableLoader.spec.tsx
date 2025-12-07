import React from 'react'
import { render } from 'uiSrc/utils/test-utils'

import TableLoader from './TableLoader'

describe('TableLoader', () => {
  it('should render', () => {
    expect(render(<TableLoader />)).toBeTruthy()
  })
})
