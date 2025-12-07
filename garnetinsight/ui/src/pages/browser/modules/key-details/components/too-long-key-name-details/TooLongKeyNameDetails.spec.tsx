import React from 'react'
import { render } from 'uiSrc/utils/test-utils'
import TooLongKeyNameDetails from './TooLongKeyNameDetails'

describe('TooLongKeyNameDetails', () => {
  it('should render', () => {
    expect(render(<TooLongKeyNameDetails onClose={jest.fn()} />)).toBeTruthy()
  })
})
