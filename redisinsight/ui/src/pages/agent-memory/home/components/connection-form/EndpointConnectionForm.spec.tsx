import React from 'react'
import { faker } from '@faker-js/faker'

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  userEvent,
  waitFor,
  waitForRedisUiSelectVisible,
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
  backendType: AgentMemoryBackendType.Oss,
  ...overrides,
})

const CLOUD_BACKEND_LABEL = 'Redis Cloud (hosted)'

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

  const switchBackendToCloud = async () => {
    await userEvent.click(screen.getByTestId('endpoint-form-backend-select'))
    await waitForRedisUiSelectVisible()
    await userEvent.click(screen.getByText(CLOUD_BACKEND_LABEL))
  }

  beforeEach(() => {
    cleanup()
    jest.clearAllMocks()
  })

  it('should render', () => {
    expect(renderComponent()).toBeTruthy()
  })

  it('should render name, backend, url and api key fields', () => {
    renderComponent()

    expect(screen.getByTestId('endpoint-form-name-input')).toBeInTheDocument()
    expect(
      screen.getByTestId('endpoint-form-backend-select'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('endpoint-form-url-input')).toBeInTheDocument()
    expect(
      screen.getByTestId('endpoint-form-api-key-input'),
    ).toBeInTheDocument()
  })

  it('should not render store id field for the default (oss) backend', () => {
    renderComponent()

    expect(screen.queryByTestId('endpoint-form-store-id-input')).toBeNull()
  })

  it('should render store id and api key fields when backend is cloud', async () => {
    renderComponent()

    await switchBackendToCloud()

    expect(
      await screen.findByTestId('endpoint-form-store-id-input'),
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('endpoint-form-api-key-input'),
    ).toBeInTheDocument()
  })

  it('should disable submit button when name and url are empty', async () => {
    renderComponent()

    await waitFor(() => {
      expect(screen.getByTestId('endpoint-form-submit-button')).toBeDisabled()
    })
  })

  it('should keep submit button disabled when only name is provided', async () => {
    renderComponent()

    await act(() => {
      fireEvent.change(screen.getByTestId('endpoint-form-name-input'), {
        target: { value: faker.lorem.word() },
      })
    })

    await waitFor(() => {
      expect(screen.getByTestId('endpoint-form-submit-button')).toBeDisabled()
    })
  })

  it('should enable submit button when name and url are provided for oss backend', async () => {
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
      expect(
        screen.getByTestId('endpoint-form-submit-button'),
      ).not.toBeDisabled()
    })
  })

  it('should require api key when an oss endpoint is switched to cloud backend', async () => {
    const editEndpoint = buildEndpoint({
      backendType: AgentMemoryBackendType.Oss,
    })
    renderComponent({ editEndpoint })

    // the form is prefilled and valid for the stored oss endpoint
    await waitFor(() => {
      expect(
        screen.getByTestId('endpoint-form-submit-button'),
      ).not.toBeDisabled()
    })

    await switchBackendToCloud()

    await act(async () => {
      fireEvent.change(
        await screen.findByTestId('endpoint-form-store-id-input'),
        { target: { value: faker.string.alphanumeric(8) } },
      )
    })

    // no stored cloud key can be assumed - api key is required
    await waitFor(() => {
      expect(screen.getByTestId('endpoint-form-submit-button')).toBeDisabled()
    })

    await act(() => {
      fireEvent.change(screen.getByTestId('endpoint-form-api-key-input'), {
        target: { value: faker.string.alphanumeric(16) },
      })
    })

    await waitFor(() => {
      expect(
        screen.getByTestId('endpoint-form-submit-button'),
      ).not.toBeDisabled()
    })
  })

  it('should not require api key when editing a cloud endpoint (stored key is kept)', async () => {
    const editEndpoint = buildEndpoint({
      backendType: AgentMemoryBackendType.Cloud,
      storeId: faker.string.alphanumeric(8),
    })
    renderComponent({ editEndpoint })

    await waitFor(() => {
      expect(
        screen.getByTestId('endpoint-form-submit-button'),
      ).not.toBeDisabled()
    })
  })

  it('should call onSubmit with only the changed fields', async () => {
    const onSubmit = jest.fn()
    const editEndpoint = buildEndpoint({
      backendType: AgentMemoryBackendType.Oss,
    })
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

  it('should call onSubmit without the untouched api key when editing a cloud endpoint', async () => {
    const onSubmit = jest.fn()
    const editEndpoint = buildEndpoint({
      backendType: AgentMemoryBackendType.Cloud,
      storeId: faker.string.alphanumeric(8),
    })
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
