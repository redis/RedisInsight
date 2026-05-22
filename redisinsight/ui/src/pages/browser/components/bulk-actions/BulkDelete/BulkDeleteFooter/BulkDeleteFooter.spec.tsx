import React from 'react'
import { mock } from 'ts-mockito'
import { Environment } from 'apiClient'
import { cleanup, fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import * as useDatabaseEnvironmentModule from 'uiSrc/components/hooks/useDatabaseEnvironment'

import BulkDeleteFooter, { Props } from './BulkDeleteFooter'
import {
  setBulkDeleteConfirmedThrough,
  setBulkDeleteGenerateReport,
  toggleBulkDeleteActionTriggered,
} from 'uiSrc/slices/browser/bulkActions'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { BulkActionConfirmation } from 'uiSrc/constants'

jest.mock('uiSrc/slices/browser/bulkActions', () => ({
  ...jest.requireActual('uiSrc/slices/browser/bulkActions'),
  setBulkDeleteGenerateReport: jest.fn().mockReturnValue({
    type: 'bulkActions/setBulkDeleteGenerateReport',
  }),
  setBulkDeleteConfirmedThrough: jest.fn().mockReturnValue({
    type: 'bulkActions/setBulkDeleteConfirmedThrough',
  }),
  toggleBulkDeleteActionTriggered: jest.fn().mockReturnValue({
    type: 'bulkActions/toggleBulkDeleteActionTriggered',
  }),
}))

const DB_NAME = 'prod-db'
const DB_HOST = '127.0.0.1'
const DB_PORT = 6379

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn(),
}))

const connectedInstanceSelectorMock = connectedInstanceSelector as jest.Mock

const mockConnectedInstance = (
  overrides: Partial<{ name: string; host: string; port: number }> = {},
) => {
  connectedInstanceSelectorMock.mockReturnValue({
    id: 'instanceId',
    name: DB_NAME,
    host: DB_HOST,
    port: DB_PORT,
    ...overrides,
  })
}

const mockedProps = {
  ...mock<Props>(),
}

const mockEnvironment = (environment: Environment) => {
  jest
    .spyOn(useDatabaseEnvironmentModule, 'useDatabaseEnvironment')
    .mockReturnValue({
      environment,
      isDangerousCommand: () => false,
    })
}

beforeEach(() => {
  cleanup()
  jest.clearAllMocks()
  mockEnvironment(Environment.Unspecified)
  mockConnectedInstance()
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('BulkDeleteFooter', () => {
  it('should render', () => {
    expect(render(<BulkDeleteFooter {...mockedProps} />)).toBeTruthy()
  })

  it('should call onCancel prop when click on Cancel btn', () => {
    const mockOnCancel = jest.fn()
    render(<BulkDeleteFooter {...mockedProps} onCancel={mockOnCancel} />)

    fireEvent.click(screen.getByTestId('bulk-action-cancel-btn'))

    expect(mockOnCancel).toBeCalled()
  })

  it('should render download report checkbox', () => {
    render(<BulkDeleteFooter {...mockedProps} />)

    expect(screen.getByTestId('download-report-checkbox')).toBeInTheDocument()
  })

  it('should dispatch setBulkDeleteGenerateReport when checkbox is toggled', () => {
    render(<BulkDeleteFooter {...mockedProps} />)

    fireEvent.click(screen.getByTestId('download-report-checkbox'))

    // Checkbox default is false, clicking toggles to true
    expect(setBulkDeleteGenerateReport).toHaveBeenCalledWith(true)
  })

  describe('non-production environment', () => {
    it.each([Environment.Unspecified, Environment.Development])(
      'uses the existing popover flow when environment is %s',
      (environment) => {
        mockEnvironment(environment)
        render(<BulkDeleteFooter {...mockedProps} />)

        fireEvent.click(screen.getByTestId('bulk-action-warning-btn'))

        // Popover is rendered (apply button is its confirm slot), modal is not
        expect(screen.getByTestId('bulk-action-apply-btn')).toBeInTheDocument()
        expect(
          screen.queryByTestId('type-to-confirm-modal-title'),
        ).not.toBeInTheDocument()
      },
    )

    it('dispatches the toggle without confirmedThrough on confirm', () => {
      mockEnvironment(Environment.Development)
      render(<BulkDeleteFooter {...mockedProps} />)

      fireEvent.click(screen.getByTestId('bulk-action-warning-btn'))
      fireEvent.click(screen.getByTestId('bulk-action-apply-btn'))

      expect(toggleBulkDeleteActionTriggered).toHaveBeenCalled()
      expect(setBulkDeleteConfirmedThrough).not.toHaveBeenCalled()
    })
  })

  describe('production environment', () => {
    beforeEach(() => {
      mockEnvironment(Environment.Production)
    })

    it('opens the TypeToConfirmModal instead of the popover', () => {
      render(<BulkDeleteFooter {...mockedProps} />)

      expect(
        screen.queryByTestId('type-to-confirm-modal-title'),
      ).not.toBeInTheDocument()

      fireEvent.click(screen.getByTestId('bulk-action-warning-btn'))

      expect(
        screen.getByTestId('type-to-confirm-modal-title'),
      ).toBeInTheDocument()
      // The popover confirm slot is not present in the prod branch
      expect(
        screen.queryByTestId('bulk-action-apply-btn'),
      ).not.toBeInTheDocument()
    })

    it('keeps the confirm button disabled until the DB name is typed exactly', () => {
      render(<BulkDeleteFooter {...mockedProps} />)
      fireEvent.click(screen.getByTestId('bulk-action-warning-btn'))

      const confirmBtn = screen.getByTestId('type-to-confirm-modal-confirm-btn')
      const input = screen.getByTestId('type-to-confirm-modal-input')

      expect(confirmBtn).toBeDisabled()

      fireEvent.change(input, { target: { value: 'wrong' } })
      expect(confirmBtn).toBeDisabled()

      fireEvent.change(input, { target: { value: DB_NAME } })
      expect(confirmBtn).not.toBeDisabled()
    })

    it('falls back to host:port when the DB name is empty', () => {
      mockConnectedInstance({ name: '' })
      render(<BulkDeleteFooter {...mockedProps} />)
      fireEvent.click(screen.getByTestId('bulk-action-warning-btn'))

      const confirmBtn = screen.getByTestId('type-to-confirm-modal-confirm-btn')
      const input = screen.getByTestId('type-to-confirm-modal-input')

      // Empty input must NOT enable confirm — that would bypass the safety check.
      expect(confirmBtn).toBeDisabled()

      fireEvent.change(input, { target: { value: `${DB_HOST}:${DB_PORT}` } })
      expect(confirmBtn).not.toBeDisabled()
    })

    it('dispatches confirmedThrough and the toggle when confirmed', () => {
      render(<BulkDeleteFooter {...mockedProps} />)
      fireEvent.click(screen.getByTestId('bulk-action-warning-btn'))

      fireEvent.change(screen.getByTestId('type-to-confirm-modal-input'), {
        target: { value: DB_NAME },
      })
      fireEvent.click(screen.getByTestId('type-to-confirm-modal-confirm-btn'))

      expect(setBulkDeleteConfirmedThrough).toHaveBeenCalledWith(
        BulkActionConfirmation.TypeToConfirm,
      )
      expect(toggleBulkDeleteActionTriggered).toHaveBeenCalled()
    })

    it('closes the modal without dispatching when cancelled', () => {
      render(<BulkDeleteFooter {...mockedProps} />)
      fireEvent.click(screen.getByTestId('bulk-action-warning-btn'))
      fireEvent.click(screen.getByTestId('type-to-confirm-modal-cancel-btn'))

      expect(
        screen.queryByTestId('type-to-confirm-modal-title'),
      ).not.toBeInTheDocument()
      expect(setBulkDeleteConfirmedThrough).not.toHaveBeenCalled()
      expect(toggleBulkDeleteActionTriggered).not.toHaveBeenCalled()
    })
  })
})
