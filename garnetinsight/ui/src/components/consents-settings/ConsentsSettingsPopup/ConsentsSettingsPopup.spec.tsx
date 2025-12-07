import React from 'react'
import { render } from 'uiSrc/utils/test-utils'
import ConsentsSettingsPopup from './ConsentsSettingsPopup'

describe('ConsentsSettingsPopup', () => {
  it('should render', () => {
    expect(render(<ConsentsSettingsPopup />)).toBeTruthy()
  })
})
