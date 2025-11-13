import { cloneDeep } from 'lodash'
import React from 'react'

import {
  createInstanceAction,
  editInstanceAction,
  instancesSelector,
} from 'uiSrc/slices/rdi/instances'
import {
  TelemetryEvent,
  TelemetryPageView,
  sendEventTelemetry,
  sendPageViewTelemetry,
} from 'uiSrc/telemetry'
import {
  act,
  cleanup,
  fireEvent,
  mockedStore,
  render,
  screen,
  waitForRiPopoverVisible,
  waitForStack,
} from 'uiSrc/utils/test-utils'

import { apiService } from 'uiSrc/services'
import RdiPage from './RdiPage'

jest.mock('uiSrc/slices/rdi/instances', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/instances'),
  editInstanceAction: jest.fn().mockReturnValue({ type: null }),
  createInstanceAction: jest.fn().mockReturnValue({ type: null }),
  instancesSelector: jest.fn().mockReturnValue({
    loading: false,
    loadingChanging: false,
    data: [
      {
        id: '1',
        name: 'My first integration',
        url: 'redis-12345.c253.us-central1-1.gce.cloud.redislabs.com:12345',
        lastConnection: new Date('1/1/2024'),
        version: '1.2',
        username: 'user',
        visible: true,
        error: '',
      },
    ],
  }),
}))

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendPageViewTelemetry: jest.fn(),
  sendEventTelemetry: jest.fn(),
}))

let storeMock: typeof mockedStore

describe('RdiPage', () => {
  beforeEach(() => {
    cleanup()
    storeMock = cloneDeep(mockedStore)
    storeMock.clearActions()
    ;(sendEventTelemetry as jest.Mock).mockRestore()
    ;(sendPageViewTelemetry as jest.Mock).mockRestore()
  })

  it('should render', () => {
    expect(render(<RdiPage />)).toBeTruthy()
  })

  it('should render instance list when instances are found', () => {
    render(<RdiPage />)

    expect(screen.getByTestId('rdi-instance-list')).toBeInTheDocument()
    expect(
      screen.queryByTestId('empty-rdi-instance-list'),
    ).not.toBeInTheDocument()
  })

  it('should render empty panel when initially loading', () => {
    ;(instancesSelector as jest.Mock).mockReturnValueOnce({
      loading: true,
      data: [],
    })
    render(<RdiPage />)

    // New table-based list renders with an empty state "Loading..." but still exists
    expect(screen.getByTestId('rdi-instance-list')).toBeInTheDocument()

    expect(
      screen.queryByTestId('empty-rdi-instance-list'),
    ).not.toBeInTheDocument()
  })

  it('should render empty message when no instances are found', () => {
    ;(instancesSelector as jest.Mock).mockReturnValueOnce({
      data: [],
    })
    render(<RdiPage />)

    expect(screen.queryByTestId('rdi-instance-list')).not.toBeInTheDocument()
    expect(screen.getByTestId('empty-rdi-instance-list')).toBeInTheDocument()
  })

  it('should open connection form when using header button', async () => {
    render(<RdiPage />)

    fireEvent.click(screen.getByTestId('rdi-instance'))
    const form = await screen.findByTestId('connection-form')

    expect(form).toBeInTheDocument()
  })

  it('should open connection form when using empty message button', async () => {
    ;(instancesSelector as jest.Mock).mockReturnValueOnce({
      loading: false,
      data: [],
    })
    const { container } = render(<RdiPage />)

    fireEvent.click(screen.getByTestId('empty-rdi-instance-button'))
    expect(container.getElementsByClassName('hidden').length).toBe(0)
  })

  it('should open connection form when using edit button', async () => {
    const { container } = render(<RdiPage />)

    fireEvent.click(screen.getByTestId('controls-button-1'))
    await waitForRiPopoverVisible()
    fireEvent.click(screen.getByTestId('edit-instance-1'))
    expect(container.getElementsByClassName('hidden').length).toBe(0)
  })

  it('should close connection form when using cancel button', async () => {
    render(<RdiPage />)

    // open form
    fireEvent.click(screen.getByTestId('rdi-instance'))

    expect(screen.getByTestId('connection-form')).toBeInTheDocument()

    // close form
    await act(async () => {
      fireEvent.click(screen.getByTestId('connection-form-cancel-button'))
    })

    expect(screen.queryByTestId('connection-form')).not.toBeInTheDocument()
  })

  it('should populate connection form with existing values when using edit button', async () => {
    render(<RdiPage />)

    fireEvent.click(screen.getByTestId('controls-button-1'))
    await waitForRiPopoverVisible()
    fireEvent.click(screen.getByTestId('edit-instance-1'))
    await screen.findByTestId('connection-form')

    expect(screen.getByTestId('connection-form-name-input')).toHaveValue(
      'My first integration',
    )
    expect(screen.getByTestId('connection-form-url-input')).toHaveValue(
      'redis-12345.c253.us-central1-1.gce.cloud.redislabs.com:12345',
    )
    expect(screen.getByTestId('connection-form-username-input')).toHaveValue(
      'user',
    )
    expect(screen.getByTestId('connection-form-password-input')).toHaveValue(
      '••••••••••••',
    )
  })

  it('should open empty connection form with "default" username value when using header button', async () => {
    render(<RdiPage />)

    expect(screen.queryByTestId('connection-form')).not.toBeInTheDocument()
    // open form
    fireEvent.click(screen.getByTestId('rdi-instance'))
    await screen.findByTestId('connection-form')
    expect(screen.queryByTestId('connection-form')).toBeInTheDocument()

    expect(screen.getByTestId('connection-form-name-input')).toHaveValue('')
    expect(screen.getByTestId('connection-form-url-input')).toHaveValue('')
    expect(screen.getByTestId('connection-form-username-input')).toHaveValue(
      'default',
    )
    expect(screen.getByTestId('connection-form-password-input')).toHaveValue('')
  })

  it('should clear password input when focused for an edited instance', async () => {
    render(<RdiPage />)

    fireEvent.click(screen.getByTestId('controls-button-1'))
    await waitForRiPopoverVisible()
    fireEvent.click(screen.getByTestId('edit-instance-1'))
    await screen.findByTestId('connection-form')

    await act(() => {
      // focus input to clear it first
      fireEvent.focus(screen.getByTestId('connection-form-password-input'))
    })

    expect(screen.getByTestId('connection-form-password-input')).toHaveValue('')
  })

  it('should call edit instance with proper data when editInstance is provided', async () => {
    render(<RdiPage />)

    fireEvent.click(screen.getByTestId('controls-button-1'))
    await waitForRiPopoverVisible()
    fireEvent.click(screen.getByTestId('edit-instance-1'))
    await screen.findByTestId('connection-form')

    await act(async () => {
      fireEvent.change(screen.getByTestId('connection-form-name-input'), {
        target: { value: 'name' },
      })

      // focus input to clear it first
      fireEvent.focus(screen.getByTestId('connection-form-password-input'))
      fireEvent.change(screen.getByTestId('connection-form-password-input'), {
        target: { value: 'password2' },
      })

      // submit form
      fireEvent.click(screen.getByTestId('connection-form-add-button'))
    })

    expect(editInstanceAction).toBeCalledWith(
      '1',
      {
        name: 'name',
        password: 'password2',
      },
      expect.any(Function),
    )
  })

  it('should not pass password when password did not changed', async () => {
    render(<RdiPage />)

    fireEvent.click(screen.getByTestId('controls-button-1'))
    await waitForRiPopoverVisible()
    fireEvent.click(screen.getByTestId('edit-instance-1'))
    await screen.findByTestId('connection-form')

    await act(() => {
      fireEvent.change(screen.getByTestId('connection-form-name-input'), {
        target: { value: 'name' },
      })

      // submit form
      fireEvent.click(screen.getByTestId('connection-form-add-button'))
    })

    expect(editInstanceAction).toBeCalledWith(
      '1',
      {
        name: 'name',
      },
      expect.any(Function),
    )
  })

  it('should call create instance when editInstance is not provided', async () => {
    render(<RdiPage />)

    // open form
    fireEvent.click(screen.getByTestId('rdi-instance'))
    await screen.findByTestId('connection-form')

    await act(() => {
      fireEvent.change(screen.getByTestId('connection-form-name-input'), {
        target: { value: 'name' },
      })
      fireEvent.change(screen.getByTestId('connection-form-url-input'), {
        target: { value: 'url' },
      })
      fireEvent.change(screen.getByTestId('connection-form-username-input'), {
        target: { value: 'username' },
      })

      // focus input to trigger password change flow
      fireEvent.focus(screen.getByTestId('connection-form-password-input'))
      fireEvent.change(screen.getByTestId('connection-form-password-input'), {
        target: { value: 'password' },
      })

      // submit form
      fireEvent.click(screen.getByTestId('connection-form-add-button'))
    })

    expect(createInstanceAction).toBeCalledWith(
      { name: 'name', url: 'url', username: 'username', password: 'password' },
      expect.any(Function),
      expect.any(Function),
    )
  })

  it('should call proper telemetry when connection form is opened', () => {
    render(<RdiPage />)

    // open form
    fireEvent.click(screen.getByTestId('rdi-instance'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_INSTANCE_ADD_CLICKED,
    })
  })

  it('should call proper telemetry when instance is submitted', async () => {
    render(<RdiPage />)

    fireEvent.click(screen.getByTestId('controls-button-1'))
    await waitForRiPopoverVisible()
    fireEvent.click(screen.getByTestId('edit-instance-1'))
    await screen.findByTestId('connection-form')

    await act(() => {
      fireEvent.change(screen.getByTestId('connection-form-password-input'), {
        target: { value: 'password3' },
      })

      // submit form
      fireEvent.click(screen.getByTestId('connection-form-add-button'))
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_INSTANCE_SUBMITTED,
    })
  })

  it('should call proper telemetry when connection form is closed', async () => {
    render(<RdiPage />)

    fireEvent.click(screen.getByTestId('controls-button-1'))
    await waitForRiPopoverVisible()
    fireEvent.click(screen.getByTestId('edit-instance-1'))
    await screen.findByTestId('connection-form')

    // close form
    fireEvent.click(screen.getByTestId('connection-form-cancel-button'))

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.RDI_INSTANCE_ADD_CANCELLED,
    })
  })

  it('should call proper sendPageViewTelemetry', async () => {
    apiService.get = jest.fn().mockResolvedValue({ data: [''], status: 200 })
    render(<RdiPage />)

    await waitForStack()

    expect(sendPageViewTelemetry).toBeCalledWith({
      name: TelemetryPageView.RDI_INSTANCES_PAGE,
      eventData: {
        instancesCount: 1,
      },
    })
  })
})
