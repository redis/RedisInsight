import React from 'react'
import { render } from 'uiSrc/utils/test-utils'

import Router from './Router'

describe('Router', () => {
  it('should render', () => {
    expect(
      render(
        <Router>
          <div>test</div>
        </Router>,
      ),
    ).toBeTruthy()
  })
})
