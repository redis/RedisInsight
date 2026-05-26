import { cloneDeep, set } from 'lodash'
import React from 'react'

import { Environment } from 'apiClient'
import { Instance } from 'uiSrc/slices/interfaces'
import { FeatureFlags } from 'uiSrc/constants'
import {
  initialStateDefault,
  mockStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'

import DatabasesListCellName from './DatabasesListCellName'

const renderCell = (
  instance: Partial<Instance>,
  { devProdMode = true }: { devProdMode?: boolean } = {},
) => {
  const state = set(
    cloneDeep(initialStateDefault),
    `app.features.featureFlags.features.${FeatureFlags.devProdMode}`,
    { flag: devProdMode },
  )

  const cellProps = { row: { original: instance as Instance } } as any
  return render(<DatabasesListCellName {...cellProps} />, {
    store: mockStore(state),
  })
}

describe('DatabasesListCellName', () => {
  const baseInstance: Partial<Instance> = {
    id: 'db-1',
    name: 'My Database',
    db: 0,
    new: false,
    cloudDetails: undefined,
  }

  describe('environment badge', () => {
    it('renders the PROD badge when environment is Production', () => {
      renderCell({ ...baseInstance, environment: Environment.Production })

      expect(screen.getByTestId('environment-badge-db-1')).toBeInTheDocument()
      expect(screen.getByText('PROD')).toBeInTheDocument()
    })

    it('renders the DEV label when environment is Development', () => {
      renderCell({ ...baseInstance, environment: Environment.Development })

      expect(screen.getByTestId('environment-badge-db-1')).toBeInTheDocument()
      expect(screen.getByText('DEV')).toBeInTheDocument()
    })

    it('renders no badge when environment is Unspecified', () => {
      renderCell({ ...baseInstance, environment: Environment.Unspecified })

      expect(
        screen.queryByTestId('environment-badge-db-1'),
      ).not.toBeInTheDocument()
      expect(screen.queryByText('PROD')).not.toBeInTheDocument()
      expect(screen.queryByText('DEV')).not.toBeInTheDocument()
    })

    it('does not render the badge when the dev-prodMode flag is off', () => {
      renderCell(
        { ...baseInstance, environment: Environment.Production },
        { devProdMode: false },
      )

      expect(
        screen.queryByTestId('environment-badge-db-1'),
      ).not.toBeInTheDocument()
    })
  })

  describe('with a temporary indicator', () => {
    it('renders the env badge alongside the "new" temp indicator', () => {
      renderCell({
        ...baseInstance,
        new: true,
        environment: Environment.Production,
      })

      expect(screen.getByTestId('database-status-new-db-1')).toBeInTheDocument()
      expect(screen.getByTestId('environment-badge-db-1')).toBeInTheDocument()
    })

    it('renders the env badge alongside the cloud warning indicator', () => {
      const fiveDaysAgo = new Date()
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)

      renderCell({
        ...baseInstance,
        lastConnection: fiveDaysAgo,
        cloudDetails: { free: true } as Instance['cloudDetails'],
        environment: Environment.Development,
      })

      expect(screen.getByTestId('environment-badge-db-1')).toBeInTheDocument()
    })
  })

  it('renders the database name', () => {
    renderCell({ ...baseInstance, name: 'production-cache', db: 3 })

    expect(screen.getByTestId('instance-name-db-1')).toHaveTextContent(
      'production-cache',
    )
  })
})
