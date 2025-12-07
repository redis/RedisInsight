import React from 'react'
import { render } from 'uiSrc/utils/test-utils'

import TimezoneForm from './TimezoneForm'

describe('TimezoneForm', () => {
  it('should render', () => {
    expect(render(<TimezoneForm />)).toBeTruthy()
  })

  it('should include timezone select', () => {
    const { container } = render(<TimezoneForm />)
    expect(
      container.querySelector('[data-test-subj="select-timezone"]'),
    ).toBeTruthy()
  })
})
