import React from 'react'

import { render } from 'uiSrc/utils/test-utils'
import { PADDING_SIZES } from './page.styles'
import { RiPageBody } from './RiPageBody'

describe('PageBody', () => {
  test('is rendered', () => {
    const { container } = render(<RiPageBody />)

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
        const { container } = render(<RiPageBody paddingSize={size} />)
        expect(container.firstChild).toHaveStyle(`padding: ${sizes[size]}`)
      })
    })
  })

  describe('restrict width', () => {
    test('can be set to a default', () => {
      const { container } = render(<RiPageBody restrictWidth />)

      expect(container.firstChild).toHaveStyle('max-width: 1200px')
    })

    test('can be set to a custom number', () => {
      const { container } = render(<RiPageBody restrictWidth={1024} />)

      expect(container.firstChild).toHaveStyle('max-width: 1024px')
    })

    test('can be set to a custom value and measurement', () => {
      const { container } = render(
        <RiPageBody
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
