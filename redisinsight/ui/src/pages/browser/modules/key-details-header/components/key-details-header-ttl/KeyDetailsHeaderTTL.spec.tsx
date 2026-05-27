import React from 'react'
import { instance, mock } from 'ts-mockito'
import { Environment } from 'apiClient'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { stringToBuffer } from 'uiSrc/utils'
import {
  initialKeyInfo,
  selectedKeyDataSelector,
} from 'uiSrc/slices/browser/keys'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import * as useDatabaseEnvironmentModule from 'uiSrc/components/hooks/useDatabaseEnvironment'
import { ProductionWriteConfirmationProvider } from 'uiSrc/components/production-write-confirmation'
import { Props, KeyDetailsHeaderTTL } from './KeyDetailsHeaderTTL'

const mockedProps = mock<Props>()

jest.mock('uiSrc/slices/browser/keys', () => ({
  ...jest.requireActual('uiSrc/slices/browser/keys'),
  selectedKeyDataSelector: jest.fn(),
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    id: 'db-1',
    name: 'prod-cache',
    host: 'localhost',
    port: 6379,
  }),
}))

const mockedKeyDataSelector = selectedKeyDataSelector as jest.Mock
const mockedConnectedInstanceSelector = connectedInstanceSelector as jest.Mock

const mockEnvironment = (environment: Environment) => {
  jest
    .spyOn(useDatabaseEnvironmentModule, 'useDatabaseEnvironment')
    .mockReturnValue({
      environment,
      isDangerousCommand: () => false,
    })
}

const renderWithProvider = (ui: React.ReactElement) =>
  render(
    <ProductionWriteConfirmationProvider>
      {ui}
    </ProductionWriteConfirmationProvider>,
  )

describe('KeyDetailsHeaderTTL', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedKeyDataSelector.mockReturnValue({
      ...initialKeyInfo,
      name: stringToBuffer('my-key'),
      nameString: 'my-key',
      ttl: 100,
    })
    mockedConnectedInstanceSelector.mockReturnValue({
      id: 'db-1',
      name: 'prod-cache',
      host: 'localhost',
      port: 6379,
    })
    mockEnvironment(Environment.Unspecified)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should render', () => {
    expect(
      render(<KeyDetailsHeaderTTL {...instance(mockedProps)} />),
    ).toBeTruthy()
  })

  describe('environment gating', () => {
    const editTTL = () => {
      const flex = screen.getByTestId('edit-ttl-btn')
      fireEvent.click(flex)
      const input = screen.getByTestId('edit-ttl-input')
      fireEvent.change(input, { target: { value: '200' } })
      fireEvent.click(screen.getByTestId('apply-btn'))
    }

    it('calls onEditTTL immediately when Unspecified', () => {
      const onEditTTL = jest.fn()
      mockEnvironment(Environment.Unspecified)
      renderWithProvider(<KeyDetailsHeaderTTL onEditTTL={onEditTTL} />)
      editTTL()
      expect(onEditTTL).toHaveBeenCalledTimes(1)
      expect(
        screen.queryByTestId('type-to-confirm-modal-input'),
      ).not.toBeInTheDocument()
    })

    it('calls onEditTTL immediately when Development', () => {
      const onEditTTL = jest.fn()
      mockEnvironment(Environment.Development)
      renderWithProvider(<KeyDetailsHeaderTTL onEditTTL={onEditTTL} />)
      editTTL()
      expect(onEditTTL).toHaveBeenCalledTimes(1)
    })

    it('defers onEditTTL behind a type-to-confirm modal when Production', () => {
      const onEditTTL = jest.fn()
      mockEnvironment(Environment.Production)
      renderWithProvider(<KeyDetailsHeaderTTL onEditTTL={onEditTTL} />)
      editTTL()
      expect(onEditTTL).not.toHaveBeenCalled()
      expect(
        screen.getByTestId('type-to-confirm-modal-input'),
      ).toBeInTheDocument()
      // Confirm is disabled until the user types the DB name
      expect(
        screen.getByTestId('type-to-confirm-modal-confirm-btn'),
      ).toBeDisabled()

      fireEvent.change(screen.getByTestId('type-to-confirm-modal-input'), {
        target: { value: 'prod-cache' },
      })
      fireEvent.click(screen.getByTestId('type-to-confirm-modal-confirm-btn'))
      expect(onEditTTL).toHaveBeenCalledTimes(1)
    })
  })
})
