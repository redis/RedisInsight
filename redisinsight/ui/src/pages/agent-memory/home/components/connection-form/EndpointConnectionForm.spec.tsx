import React from 'react'
import { faker } from '@faker-js/faker'

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from 'uiSrc/utils/test-utils'
import {
  AgentMemoryBackendType,
  AgentMemoryEndpoint,
} from 'uiSrc/slices/interfaces/agentMemory'

import EndpointConnectionForm, {
  EndpointConnectionFormProps,
} from './EndpointConnectionForm'

const buildEndpoint = (
  overrides: Partial<AgentMemoryEndpoint> = {},
): AgentMemoryEndpoint => ({
  id: faker.string.uuid(),
  name: faker.lorem.words(2),
  url: faker.internet.url(),
  backendType: AgentMemoryBackendType.Cloud,
  storeId: faker.string.alphanumeric(8),
  ...overrides,
})

describe('EndpointConnectionForm', () => {
  const defaultProps: EndpointConnectionFormProps = {
    onSubmit: jest.fn(),
    onCancel: jest.fn(),
    editEndpoint: null,
    isLoading: false,
  }

  const renderComponent = (
    propsOverride?: Partial<EndpointConnectionFormProps>,
  ) => {
    const props = { ...defaultProps, ...propsOverride }

    return render(
      <>
        <EndpointConnectionForm {...props} />
        <div id="footerDatabaseForm" />
      </>,
    )
  }

  const fillCreateForm = () => {
    fireEvent.change(screen.getByTestId('endpoint-form-name-input'), {
      target: { value: faker.lorem.word() },
    })
    fireEvent.change(screen.getByTestId('endpoint-form-url-input'), {
      target: { value: faker.internet.url() },
    })
    fireEvent.change(screen.getByTestId('endpoint-form-store-id-input'), {
      target: { value: faker.string.alphanumeric(8) },
    })
    fireEvent.change(screen.getByTestId('endpoint-form-api-key-input'), {
      target: { value: faker.string.alphanumeric(16) },
    })
  }

  beforeEach(() => {
    cleanup()
    jest.clearAllMocks()
  })

  it('should render', () => {
    expect(renderComponent()).toBeTruthy()
  })

  it('should render name, url, store id and api key fields (no backend picker)', () => {
    renderComponent()

    expect(screen.getByTestId('endpoint-form-name-input')).toBeInTheDocument()
    expect(screen.getByTestId('endpoint-form-url-input')).toBeInTheDocument()
    expect(
      screen.getByTestId('endpoint-form-store-id-input'),
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('endpoint-form-api-key-input'),
    ).toBeInTheDocument()
    expect(screen.queryByTestId('endpoint-form-backend-select')).toBeNull()
  })

  it('should disable submit button when required fields are empty', async () => {
    renderComponent()

    await waitFor(() => {
      expect(screen.getByTestId('endpoint-form-submit-button')).toBeDisabled()
    })
  })

  it('should keep submit disabled when only some required fields are provided', async () => {
    renderComponent()

    await act(() => {
      fireEvent.change(screen.getByTestId('endpoint-form-name-input'), {
        target: { value: faker.lorem.word() },
      })
      fireEvent.change(screen.getByTestId('endpoint-form-url-input'), {
        target: { value: faker.internet.url() },
      })
    })

    await waitFor(() => {
      expect(screen.getByTestId('endpoint-form-submit-button')).toBeDisabled()
    })
  })

  it('should enable submit when name, url, store id and api key are provided', async () => {
    renderComponent()

    await act(() => {
      fillCreateForm()
    })

    await waitFor(() => {
      expect(
        screen.getByTestId('endpoint-form-submit-button'),
      ).not.toBeDisabled()
    })
  })

  it('should not require api key when editing an endpoint (stored key is kept)', async () => {
    const editEndpoint = buildEndpoint()
    renderComponent({ editEndpoint })

    await waitFor(() => {
      expect(
        screen.getByTestId('endpoint-form-submit-button'),
      ).not.toBeDisabled()
    })
  })

  it('should call onSubmit with only the changed fields', async () => {
    const onSubmit = jest.fn()
    const editEndpoint = buildEndpoint()
    const newName = faker.lorem.words(3)
    renderComponent({ editEndpoint, onSubmit })

    await act(() => {
      fireEvent.change(screen.getByTestId('endpoint-form-name-input'), {
        target: { value: newName },
      })
    })

    await waitFor(() => {
      expect(
        screen.getByTestId('endpoint-form-submit-button'),
      ).not.toBeDisabled()
    })

    fireEvent.click(screen.getByTestId('endpoint-form-submit-button'))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ name: newName })
    })
  })

  it('should call onSubmit without the untouched api key when editing', async () => {
    const onSubmit = jest.fn()
    const editEndpoint = buildEndpoint()
    renderComponent({ editEndpoint, onSubmit })

    await waitFor(() => {
      expect(
        screen.getByTestId('endpoint-form-submit-button'),
      ).not.toBeDisabled()
    })

    fireEvent.click(screen.getByTestId('endpoint-form-submit-button'))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({})
    })
  })

  it('should call onCancel when cancel button is clicked', async () => {
    const onCancel = jest.fn()
    renderComponent({ onCancel })

    fireEvent.click(await screen.findByTestId('endpoint-form-cancel-button'))

    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('should disable submit button when isLoading is true', async () => {
    const editEndpoint = buildEndpoint()
    renderComponent({ editEndpoint, isLoading: true })

    await waitFor(() => {
      expect(screen.getByTestId('endpoint-form-submit-button')).toBeDisabled()
    })
  })
})
