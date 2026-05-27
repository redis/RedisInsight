import { cloneDeep, set } from 'lodash'
import React from 'react'

import { Environment } from 'apiClient'
import { FeatureFlags } from 'uiSrc/constants'
import {
  initialStateDefault,
  mockStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'

import { EnvironmentBadge } from './EnvironmentBadge'

const withDevProdFlag = (flag: boolean) => {
  const state = set(
    cloneDeep(initialStateDefault),
    `app.features.featureFlags.features.${FeatureFlags.devProdMode}`,
    { flag },
  )
  return { store: mockStore(state) }
}

describe('EnvironmentBadge', () => {
  it('renders the PROD badge for production environment', () => {
    render(
      <EnvironmentBadge environment={Environment.Production} />,
      withDevProdFlag(true),
    )

    expect(
      screen.getByTestId(`environment-badge-${Environment.Production}`),
    ).toBeInTheDocument()
    expect(screen.getByText('PROD')).toBeInTheDocument()
  })

  it('renders the DEV label for development environment', () => {
    render(
      <EnvironmentBadge environment={Environment.Development} />,
      withDevProdFlag(true),
    )

    expect(
      screen.getByTestId(`environment-badge-${Environment.Development}`),
    ).toBeInTheDocument()
    expect(screen.getByText('DEV')).toBeInTheDocument()
  })

  it('renders nothing for unspecified environment', () => {
    const { container } = render(
      <EnvironmentBadge environment={Environment.Unspecified} />,
      withDevProdFlag(true),
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when environment is undefined', () => {
    const { container } = render(
      <EnvironmentBadge environment={undefined} />,
      withDevProdFlag(true),
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when the dev-prodMode feature flag is off', () => {
    const { container } = render(
      <EnvironmentBadge environment={Environment.Production} />,
      withDevProdFlag(false),
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('uses the provided dataTestId override', () => {
    render(
      <EnvironmentBadge
        environment={Environment.Production}
        dataTestId="custom-badge"
      />,
      withDevProdFlag(true),
    )

    expect(screen.getByTestId('custom-badge')).toBeInTheDocument()
  })
})
