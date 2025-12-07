import React from 'react'

import { render, screen } from 'uiSrc/utils/test-utils'
import { RedisCloudSubscriptionStatus } from 'uiSrc/slices/interfaces'

import { AlertCell } from './AlertCell'

describe('AlertCell', () => {
  it('should render success icon when subscription is active and has databases', () => {
    render(
      <AlertCell
        status={RedisCloudSubscriptionStatus.Active}
        numberOfDatabases={5}
      />,
    )

    const icon = screen.getByRole('img', { hidden: true })
    expect(icon).toBeInTheDocument()
  })

  it('should render warning icon when subscription is not active', () => {
    render(
      <AlertCell
        status={RedisCloudSubscriptionStatus.Deleting}
        numberOfDatabases={5}
      />,
    )

    const alertIcon = screen.getByLabelText('subscription alert')
    expect(alertIcon).toBeInTheDocument()
  })

  it('should render warning icon when subscription has no databases', () => {
    render(
      <AlertCell
        status={RedisCloudSubscriptionStatus.Active}
        numberOfDatabases={0}
      />,
    )

    const alertIcon = screen.getByLabelText('subscription alert')
    expect(alertIcon).toBeInTheDocument()
  })

  it('should render warning icon when subscription is not active and has no databases', () => {
    render(
      <AlertCell
        status={RedisCloudSubscriptionStatus.Error}
        numberOfDatabases={0}
      />,
    )

    const alertIcon = screen.getByLabelText('subscription alert')
    expect(alertIcon).toBeInTheDocument()
  })
})
