import React from 'react'
import { Environment } from 'apiClient'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import * as useDatabaseEnvironmentModule from 'uiSrc/components/hooks/useDatabaseEnvironment'
import { DBInstanceFactory } from 'uiSrc/mocks/factories/database/DBInstance.factory'

import {
  ProductionWriteConfirmationProvider,
  ProductionWriteConfirmationRequest,
  useProductionWriteConfirmation,
} from '.'

const defaultInstance = DBInstanceFactory.build({ name: 'prod-cache' })

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn(),
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
    mockedConnectedInstanceSelector.mockReturnValue(defaultInstance)
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
    const namelessInstance = DBInstanceFactory.build({ name: '' })
    mockedConnectedInstanceSelector.mockReturnValue(namelessInstance)
    mockEnvironment(Environment.Production)
    const action = jest.fn()

    renderWithProvider(<Trigger onConfirm={action} />)
    fireEvent.click(screen.getByTestId('trigger'))

    expect(
      screen.getByTestId('type-to-confirm-modal-confirm-btn'),
    ).toBeDisabled()

    typeInConfirmInput(`${namelessInstance.host}:${namelessInstance.port}`)
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

  it('hides the skip-for-session checkbox when commandId is not provided', () => {
    mockEnvironment(Environment.Production)

    renderWithProvider(<Trigger onConfirm={jest.fn()} />)
    fireEvent.click(screen.getByTestId('trigger'))

    expect(
      screen.queryByTestId('type-to-confirm-modal-skip-checkbox'),
    ).not.toBeInTheDocument()
  })

  it('shows the skip-for-session checkbox when commandId is provided', () => {
    mockEnvironment(Environment.Production)

    renderWithProvider(
      <Trigger onConfirm={jest.fn()} overrides={{ commandId: 'edit-value' }} />,
    )
    fireEvent.click(screen.getByTestId('trigger'))

    expect(
      screen.getByTestId('type-to-confirm-modal-skip-checkbox'),
    ).toBeInTheDocument()
  })

  it('skips the modal on subsequent calls with the same commandId when user opts in', () => {
    mockEnvironment(Environment.Production)
    const action = jest.fn()

    renderWithProvider(
      <Trigger onConfirm={action} overrides={{ commandId: 'edit-value' }} />,
    )

    // First call shows the modal; confirm with "don't ask again" checked
    fireEvent.click(screen.getByTestId('trigger'))
    typeInConfirmInput('prod-cache')
    fireEvent.click(screen.getByTestId('type-to-confirm-modal-skip-checkbox'))
    fireEvent.click(screen.getByTestId('type-to-confirm-modal-confirm-btn'))

    expect(action).toHaveBeenCalledTimes(1)

    // Second call with the same commandId should bypass the modal entirely
    fireEvent.click(screen.getByTestId('trigger'))

    expect(action).toHaveBeenCalledTimes(2)
    expect(
      screen.queryByTestId('type-to-confirm-modal-input'),
    ).not.toBeInTheDocument()
  })

  it('still shows the modal on subsequent calls when user did not opt in', () => {
    mockEnvironment(Environment.Production)
    const action = jest.fn()

    renderWithProvider(
      <Trigger onConfirm={action} overrides={{ commandId: 'edit-value' }} />,
    )

    fireEvent.click(screen.getByTestId('trigger'))
    typeInConfirmInput('prod-cache')
    fireEvent.click(screen.getByTestId('type-to-confirm-modal-confirm-btn'))

    expect(action).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByTestId('trigger'))

    expect(
      screen.getByTestId('type-to-confirm-modal-input'),
    ).toBeInTheDocument()
  })

  it('does not skip the modal for a different commandId', () => {
    mockEnvironment(Environment.Production)
    const action = jest.fn()

    const Multi = () => {
      const { requestConfirmation } = useProductionWriteConfirmation()
      return (
        <>
          <button
            type="button"
            data-testid="trigger-edit"
            onClick={() =>
              requestConfirmation({
                actionDescription: 'edit',
                commandId: 'edit-value',
                onConfirm: action,
              })
            }
          >
            edit
          </button>
          <button
            type="button"
            data-testid="trigger-rename"
            onClick={() =>
              requestConfirmation({
                actionDescription: 'rename',
                commandId: 'rename-key',
                onConfirm: action,
              })
            }
          >
            rename
          </button>
        </>
      )
    }

    renderWithProvider(<Multi />)

    fireEvent.click(screen.getByTestId('trigger-edit'))
    typeInConfirmInput('prod-cache')
    fireEvent.click(screen.getByTestId('type-to-confirm-modal-skip-checkbox'))
    fireEvent.click(screen.getByTestId('type-to-confirm-modal-confirm-btn'))

    // The other commandId must still trigger the modal
    fireEvent.click(screen.getByTestId('trigger-rename'))

    expect(
      screen.getByTestId('type-to-confirm-modal-input'),
    ).toBeInTheDocument()
  })

  it('only skips when every commandId in an array request is already in the skip set', () => {
    mockEnvironment(Environment.Production)
    const action = jest.fn()

    renderWithProvider(
      <Trigger
        onConfirm={action}
        overrides={{ commandId: ['FLUSHALL', 'FLUSHDB'] }}
      />,
    )

    fireEvent.click(screen.getByTestId('trigger'))
    typeInConfirmInput('prod-cache')
    fireEvent.click(screen.getByTestId('type-to-confirm-modal-skip-checkbox'))
    fireEvent.click(screen.getByTestId('type-to-confirm-modal-confirm-btn'))

    expect(action).toHaveBeenCalledTimes(1)

    // Same array — fully covered → no modal
    fireEvent.click(screen.getByTestId('trigger'))
    expect(action).toHaveBeenCalledTimes(2)
    expect(
      screen.queryByTestId('type-to-confirm-modal-input'),
    ).not.toBeInTheDocument()
  })

  it('does not skip when an array request contains a not-yet-skipped commandId', () => {
    mockEnvironment(Environment.Production)
    const action = jest.fn()

    const Multi = () => {
      const { requestConfirmation } = useProductionWriteConfirmation()
      return (
        <>
          <button
            type="button"
            data-testid="trigger-flushall"
            onClick={() =>
              requestConfirmation({
                actionDescription: 'flushall',
                commandId: 'FLUSHALL',
                onConfirm: action,
              })
            }
          >
            flushall
          </button>
          <button
            type="button"
            data-testid="trigger-mixed"
            onClick={() =>
              requestConfirmation({
                actionDescription: 'mixed',
                commandId: ['FLUSHALL', 'DEBUG'],
                onConfirm: action,
              })
            }
          >
            mixed
          </button>
        </>
      )
    }

    renderWithProvider(<Multi />)

    // Opt out of FLUSHALL only
    fireEvent.click(screen.getByTestId('trigger-flushall'))
    typeInConfirmInput('prod-cache')
    fireEvent.click(screen.getByTestId('type-to-confirm-modal-skip-checkbox'))
    fireEvent.click(screen.getByTestId('type-to-confirm-modal-confirm-btn'))

    // Array contains DEBUG which is not in the skip set → must prompt
    fireEvent.click(screen.getByTestId('trigger-mixed'))
    expect(
      screen.getByTestId('type-to-confirm-modal-input'),
    ).toBeInTheDocument()
  })

  it('resets the skip list when the connected database changes', () => {
    mockEnvironment(Environment.Production)
    const action = jest.fn()

    const { unmount } = renderWithProvider(
      <Trigger onConfirm={action} overrides={{ commandId: 'edit-value' }} />,
    )

    fireEvent.click(screen.getByTestId('trigger'))
    typeInConfirmInput('prod-cache')
    fireEvent.click(screen.getByTestId('type-to-confirm-modal-skip-checkbox'))
    fireEvent.click(screen.getByTestId('type-to-confirm-modal-confirm-btn'))

    // A fresh mount represents switching DBs (provider unmounts with the
    // previous KeyDetails subtree and re-mounts when a new key is opened
    // on the new database).
    unmount()
    mockedConnectedInstanceSelector.mockReturnValue(
      DBInstanceFactory.build({ name: 'another-db' }),
    )

    renderWithProvider(
      <Trigger onConfirm={action} overrides={{ commandId: 'edit-value' }} />,
    )

    fireEvent.click(screen.getByTestId('trigger'))

    expect(
      screen.getByTestId('type-to-confirm-modal-input'),
    ).toBeInTheDocument()
  })
})
