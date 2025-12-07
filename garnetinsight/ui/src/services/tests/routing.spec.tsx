import React from 'react'
import { Link } from 'uiSrc/components/base/link/Link'
import { Pages } from 'uiSrc/constants'
import { getRouterLinkProps } from 'uiSrc/services'
import { render, fireEvent, screen } from 'uiSrc/utils/test-utils'

describe('getRouterLinkProps', () => {
  it('should call click callback', () => {
    const mockOnClick = jest.fn()

    render(
      <Link
        {...getRouterLinkProps(Pages.browser, mockOnClick)}
        data-testid="link"
      >
        Text
      </Link>,
    )
    fireEvent.click(screen.getByTestId('link'))

    expect(mockOnClick).toBeCalled()
  })
})
