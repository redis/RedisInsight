import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import { AclTip } from './AclTip'

describe('AclTip', () => {
  const renderComponent = () => render(<AclTip />)

  it('should render the tip prefix', () => {
    renderComponent()

    expect(screen.getByText(/Tip:/i)).toBeInTheDocument()
  })

  it('should render a link to the Redis ACL documentation', () => {
    renderComponent()

    const link = screen.getByRole('link', { name: /Redis ACLs/i })

    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute(
      'href',
      'https://redis.io/docs/management/security/acl/',
    )
    expect(link).toHaveAttribute('target', '_blank')
  })
})
