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

const withProdModeFlag = (flag: boolean) => {
  const state = set(
    cloneDeep(initialStateDefault),
    `app.features.featureFlags.features.${FeatureFlags.prodMode}`,
    { flag },
  )
  return { store: mockStore(state) }
}

describe('EnvironmentBadge', () => {
  it('renders the PROD badge for production environment', () => {
    render(
      <EnvironmentBadge environment={Environment.Production} />,
      withProdModeFlag(true),
    )

    expect(
      screen.getByTestId(`environment-badge-${Environment.Production}`),
    ).toBeInTheDocument()
    expect(screen.getByText('PROD')).toBeInTheDocument()
  })

  it('renders the DEV label for development environment', () => {
    render(
      <EnvironmentBadge environment={Environment.Development} />,
      withProdModeFlag(true),
    )

    expect(
      screen.getByTestId(`environment-badge-${Environment.Development}`),
    ).toBeInTheDocument()
    expect(screen.getByText('DEV')).toBeInTheDocument()
  })

  it('renders nothing for unspecified environment', () => {
    const { container } = render(
      <EnvironmentBadge environment={Environment.Unspecified} />,
      withProdModeFlag(true),
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when environment is undefined', () => {
    const { container } = render(
      <EnvironmentBadge environment={undefined} />,
      withProdModeFlag(true),
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when the prodMode feature flag is off', () => {
    const { container } = render(
      <EnvironmentBadge environment={Environment.Production} />,
      withProdModeFlag(false),
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('uses the provided dataTestId override', () => {
    render(
      <EnvironmentBadge
        environment={Environment.Production}
        dataTestId="custom-badge"
      />,
      withProdModeFlag(true),
    )

    expect(screen.getByTestId('custom-badge')).toBeInTheDocument()
  })
})
