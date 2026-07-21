import React from 'react'

import { Environment } from 'apiClient'
import { render, screen } from 'uiSrc/utils/test-utils'

import { EnvironmentBadge } from './EnvironmentBadge'

describe('EnvironmentBadge', () => {
  it('renders the PROD badge for production environment', () => {
    render(<EnvironmentBadge environment={Environment.Production} />)

    expect(
      screen.getByTestId(`environment-badge-${Environment.Production}`),
    ).toBeInTheDocument()
    expect(screen.getByText('PROD')).toBeInTheDocument()
  })

  it('renders the DEV label for development environment', () => {
    render(<EnvironmentBadge environment={Environment.Development} />)

    expect(
      screen.getByTestId(`environment-badge-${Environment.Development}`),
    ).toBeInTheDocument()
    expect(screen.getByText('DEV')).toBeInTheDocument()
  })

  it('renders nothing for unspecified environment', () => {
    const { container } = render(
      <EnvironmentBadge environment={Environment.Unspecified} />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when environment is undefined', () => {
    const { container } = render(<EnvironmentBadge environment={undefined} />)

    expect(container).toBeEmptyDOMElement()
  })

  it('uses the provided dataTestId override', () => {
    render(
      <EnvironmentBadge
        environment={Environment.Production}
        dataTestId="custom-badge"
      />,
    )

    expect(screen.getByTestId('custom-badge')).toBeInTheDocument()
  })
})
