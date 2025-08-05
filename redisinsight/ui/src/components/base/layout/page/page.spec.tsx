import React from 'react'
import { render } from 'uiSrc/utils/test-utils'
import { PADDING_SIZES } from './page.styles'
import { RiPage } from './RiPage'

describe('RIPage', () => {
  it('is rendered', () => {
    const { container } = render(<RiPage />)

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
        const { container } = render(<RiPage paddingSize={size} />)
        expect(container.firstChild).toHaveStyle(`padding: ${sizes[size]}`)
      })
    })
  })

  describe('grow', () => {
    it(`grow 'true' gives flex-grow: 1`, () => {
      const { container } = render(<RiPage grow />)

      expect(container.firstChild).toHaveStyle('flex-grow: 1')
    })
    it(`grow 'false' does not render flex-grow`, () => {
      const { container } = render(<RiPage grow={false} />)

      expect(container.firstChild).not.toHaveStyle('flex-grow: 1')
    })
  })

  describe('direction', () => {
    it(`can be row`, () => {
      const { container } = render(
        <RiPage direction="row" restrictWidth style={{ width: '1000px' }} />,
      )

      expect(container.firstChild).toHaveStyle('flex-direction: column')
    })
    it(`can be column`, () => {
      const { container } = render(<RiPage direction="column" />)

      expect(container.firstChild).toHaveStyle('flex-direction: column')
    })
  })

  describe('restrict width', () => {
    it('can be set to a default', () => {
      const { container } = render(<RiPage restrictWidth />)

      expect(container.firstChild).toHaveStyle('max-width: 1200px')
    })

    it('can be set to a custom number', () => {
      const { container } = render(<RiPage restrictWidth={1024} />)

      expect(container.firstChild).toHaveStyle('max-width: 1024px')
    })

    it('can be set to a custom value and does not override custom style', () => {
      const { container } = render(
        <RiPage
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
