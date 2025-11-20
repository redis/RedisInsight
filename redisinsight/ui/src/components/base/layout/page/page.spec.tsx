import React from 'react'
import { PADDING_SIZES } from 'uiSrc/components/base/layout/page/page.styles'
import Page from 'uiSrc/components/base/layout/page/Page'
import { render } from 'uiSrc/utils/test-utils'

describe('RIPage', () => {
  it('is rendered', () => {
    const { container } = render(<Page />)

    expect(container.firstChild).toBeTruthy()
  })

  describe('paddingSize', () => {
    const sizes = {
      none: '0',
      s: '8px',
      m: '16px',
      l: '24px',
    }
    PADDING_SIZES.forEach((size) => {
      it(`padding '${size}' is rendered`, () => {
        const { container } = render(<Page paddingSize={size} />)
        expect(container.firstChild).toHaveStyle(`padding: ${sizes[size]}`)
      })
    })
  })

  describe('grow', () => {
    it(`grow 'true' gives flex-grow: 1`, () => {
      const { container } = render(<Page grow />)

      expect(container.firstChild).toHaveStyle('flex-grow: 1')
    })
    it(`grow 'false' does not render flex-grow`, () => {
      const { container } = render(<Page grow={false} />)

      expect(container.firstChild).not.toHaveStyle('flex-grow: 1')
    })
  })

  describe('direction', () => {
    it(`can be row`, () => {
      const { container } = render(
        <Page direction="row" restrictWidth style={{ width: '1000px' }} />,
      )

      expect(container.firstChild).toHaveStyle('flex-direction: row')
    })
  })

  describe('restrict width', () => {
    it('can be set to a default', () => {
      const { container } = render(<Page restrictWidth />)

      expect(container.firstChild).toHaveStyle('max-width: 1200px')
    })

    it('can be set to a custom number', () => {
      const { container } = render(<Page restrictWidth={1024} />)

      expect(container.firstChild).toHaveStyle('max-width: 1024px')
    })

    it('can be set to a custom value and does not override custom style', () => {
      const { container } = render(
        <Page
          restrictWidth="24rem"
          style={{
            color: 'red ',
          }}
        />,
      )

      expect(container.firstChild).toHaveStyle('max-width: 24rem; color: red;')
    })
  })
})
