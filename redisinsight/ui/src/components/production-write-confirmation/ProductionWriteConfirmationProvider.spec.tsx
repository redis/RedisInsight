import React from 'react'
import { Environment } from 'apiClient'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import * as useDatabaseEnvironmentModule from 'uiSrc/components/hooks/useDatabaseEnvironment'

import {
  ProductionWriteConfirmationProvider,
  ProductionWriteConfirmationRequest,
  useProductionWriteConfirmation,
} from '.'

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    name: 'prod-cache',
    host: 'localhost',
    port: 6379,
  }),
}))

const mockedConnectedInstanceSelector = connectedInstanceSelector as jest.Mock

const mockEnvironment = (environment: Environment) => {
  jest
    .spyOn(useDatabaseEnvironmentModule, 'useDatabaseEnvironment')
    .mockReturnValue({
      environment,
      isDangerousCommand: () => false,
    })
}

const typeInConfirmInput = (value: string) => {
  fireEvent.change(screen.getByTestId('type-to-confirm-modal-input'), {
    target: { value },
  })
}

interface TriggerProps {
  onConfirm: jest.Mock
  overrides?: Partial<ProductionWriteConfirmationRequest>
}

const Trigger = ({ onConfirm, overrides }: TriggerProps) => {
  const { requestConfirmation } = useProductionWriteConfirmation()
  return (
    <button
      type="button"
      onClick={() =>
        requestConfirmation({
          actionDescription: 'description',
          onConfirm,
          ...overrides,
        })
      }
      data-testid="trigger"
    >
      trigger
    </button>
  )
}

const renderWithProvider = (ui: React.ReactElement) =>
  render(
    <ProductionWriteConfirmationProvider>
      {ui}
    </ProductionWriteConfirmationProvider>,
  )

describe('ProductionWriteConfirmationProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedConnectedInstanceSelector.mockReturnValue({
      name: 'prod-cache',
      host: 'localhost',
      port: 6379,
    })
    mockEnvironment(Environment.Unspecified)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('runs action immediately when environment is Unspecified', () => {
    mockEnvironment(Environment.Unspecified)
    const action = jest.fn()

    renderWithProvider(<Trigger onConfirm={action} />)
    fireEvent.click(screen.getByTestId('trigger'))

    expect(action).toHaveBeenCalledTimes(1)
    expect(
      screen.queryByTestId('type-to-confirm-modal-input'),
    ).not.toBeInTheDocument()
  })

  it('runs action immediately when environment is Development', () => {
    mockEnvironment(Environment.Development)
    const action = jest.fn()

    renderWithProvider(<Trigger onConfirm={action} />)
    fireEvent.click(screen.getByTestId('trigger'))

    expect(action).toHaveBeenCalledTimes(1)
    expect(
      screen.queryByTestId('type-to-confirm-modal-input'),
    ).not.toBeInTheDocument()
  })

  it('defers action and shows TypeToConfirm modal when environment is Production', () => {
    mockEnvironment(Environment.Production)
    const action = jest.fn()

    renderWithProvider(<Trigger onConfirm={action} />)
    fireEvent.click(screen.getByTestId('trigger'))

    expect(action).not.toHaveBeenCalled()
    expect(
      screen.getByTestId('type-to-confirm-modal-input'),
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('type-to-confirm-modal-confirm-btn'),
    ).toBeDisabled()
  })

  it('runs action only after user types DB name and confirms in production', () => {
    mockEnvironment(Environment.Production)
    const action = jest.fn()

    renderWithProvider(<Trigger onConfirm={action} />)
    fireEvent.click(screen.getByTestId('trigger'))

    typeInConfirmInput('prod-cache')
    fireEvent.click(screen.getByTestId('type-to-confirm-modal-confirm-btn'))

    expect(action).toHaveBeenCalledTimes(1)
  })

  it('falls back to host:port when DB name is empty', () => {
    mockedConnectedInstanceSelector.mockReturnValue({
      name: '',
      host: 'localhost',
      port: 6379,
    })
    mockEnvironment(Environment.Production)
    const action = jest.fn()

    renderWithProvider(<Trigger onConfirm={action} />)
    fireEvent.click(screen.getByTestId('trigger'))

    expect(
      screen.getByTestId('type-to-confirm-modal-confirm-btn'),
    ).toBeDisabled()

    typeInConfirmInput('localhost:6379')
    fireEvent.click(screen.getByTestId('type-to-confirm-modal-confirm-btn'))

    expect(action).toHaveBeenCalledTimes(1)
  })

  it('cancels action and calls onCancel when user cancels in production', () => {
    mockEnvironment(Environment.Production)
    const action = jest.fn()
    const onCancel = jest.fn()

    renderWithProvider(<Trigger onConfirm={action} overrides={{ onCancel }} />)
    fireEvent.click(screen.getByTestId('trigger'))
    fireEvent.click(screen.getByTestId('type-to-confirm-modal-cancel-btn'))

    expect(action).not.toHaveBeenCalled()
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('runs action immediately when hook is used outside the provider', () => {
    mockEnvironment(Environment.Production)
    const action = jest.fn()

    // Render without the provider — fallback should run action immediately
    render(<Trigger onConfirm={action} />)
    fireEvent.click(screen.getByTestId('trigger'))

    expect(action).toHaveBeenCalledTimes(1)
    expect(
      screen.queryByTestId('type-to-confirm-modal-input'),
    ).not.toBeInTheDocument()
  })
})
