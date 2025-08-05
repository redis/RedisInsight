import React from 'react'
import { RiLink } from 'uiSrc/components/base/display'
import { Pages } from 'uiSrc/constants'
import { getRouterLinkProps } from 'uiSrc/services'
import { render, fireEvent, screen } from 'uiSrc/utils/test-utils'

describe('getRouterLinkProps', () => {
  it('should call click callback', () => {
    const mockOnClick = jest.fn()

    render(
      <RiLink
        {...getRouterLinkProps(Pages.browser, mockOnClick)}
        data-testid="link"
      >
        Text
      </RiLink>,
    )
    fireEvent.click(screen.getByTestId('link'))

    expect(mockOnClick).toBeCalled()
  })
})
