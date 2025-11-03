import React from 'react'

import { render } from 'uiSrc/utils/test-utils'
import { Spacer } from './Spacer'
import { SpacerProps } from './spacer.styles'

const sizeToValue = {
  xs: '0.2rem',
  s: '0.4rem',
  m: '0.8rem',
  l: '1.6rem',
  xl: '2rem',
  xxl: '2.4rem',
} as const
describe('Spacer', () => {
  test('is rendered', () => {
    const { container } = render(<Spacer />)

    expect(container.firstChild).toBeTruthy()
  })

  describe('Size', () => {
    Object.entries(sizeToValue).forEach(([size, value]) => {
      it(`size '${size}' is rendered`, () => {
        const { container } = render(
          <Spacer size={size as SpacerProps['size']} />,
        )
        expect(container.firstChild).toHaveStyle(`height: ${value}`)
      })
    })
  })

  describe('Direction', () => {
    it(`width is rendered for Horizontal direction`, () => {
      const { container } = render(<Spacer />)
      expect(container.firstChild).toHaveStyle(`height: 1.6rem`)
      expect(container.firstChild).not.toHaveStyle(`width: 1.6rem`)
    })
    it(`width is rendered for explicit Horizontal direction`, () => {
      const { container } = render(<Spacer direction="horizontal" />)
      expect(container.firstChild).toHaveStyle(`width: 1.6rem`)
      expect(container.firstChild).not.toHaveStyle(`height: 1.6rem`)
    })
    it(`height is rendered for Vertical direction`, () => {
      const { container } = render(<Spacer direction="vertical" />)
      expect(container.firstChild).toHaveStyle('height: 1.6rem')
      expect(container.firstChild).not.toHaveStyle(`width: 1.6rem`)
    })
  })
})
