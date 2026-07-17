import React from 'react'
import { cloneDeep } from 'lodash'
import { faker } from '@faker-js/faker'

import type { RootState } from 'uiSrc/slices/store'
import { deleteEndpointsAction } from 'uiSrc/slices/agentMemory/endpoints'
import {
  AgentMemoryBackendType,
  AgentMemoryEndpoint,
} from 'uiSrc/slices/interfaces/agentMemory'
import {
  cleanup,
  fireEvent,
  initialStateDefault,
  mockStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'

import EndpointsList, { EndpointsListProps } from './EndpointsList'

jest.mock('uiSrc/slices/agentMemory/endpoints', () => ({
  ...jest.requireActual('uiSrc/slices/agentMemory/endpoints'),
  deleteEndpointsAction: jest.fn(() => ({ type: 'DELETE_ENDPOINTS' })),
}))

const buildEndpoint = (
  overrides: Partial<AgentMemoryEndpoint> = {},
): AgentMemoryEndpoint => ({
  id: faker.string.uuid(),
  name: faker.lorem.words(2),
  url: faker.internet.url(),
  backendType: AgentMemoryBackendType.Oss,
  ...overrides,
})

const mockedEndpoints: AgentMemoryEndpoint[] = [
  buildEndpoint({ backendType: AgentMemoryBackendType.Oss }),
  buildEndpoint({ backendType: AgentMemoryBackendType.Cloud }),
]

const createStore = (endpoints: AgentMemoryEndpoint[]) => {
  const state = cloneDeep(initialStateDefault) as RootState
  state.agentMemory.endpoints.data = endpoints
  return mockStore(state)
}

describe('EndpointsList', () => {
  const defaultProps: EndpointsListProps = {
    onEdit: jest.fn(),
    onConnect: jest.fn(),
  }

  const renderComponent = (
    propsOverride?: Partial<EndpointsListProps>,
    endpoints: AgentMemoryEndpoint[] = mockedEndpoints,
  ) => {
    const props = { ...defaultProps, ...propsOverride }
    const store = createStore(endpoints)

    return { store, ...render(<EndpointsList {...props} />, { store }) }
  }

  beforeEach(() => {
    cleanup()
    jest.clearAllMocks()
  })

  it('should render', () => {
    expect(renderComponent()).toBeTruthy()
  })

  it('should render a row for each endpoint from the store', () => {
    renderComponent()

    expect(
      screen.getByTestId('agent-memory-endpoints-list'),
    ).toBeInTheDocument()

    mockedEndpoints.forEach((endpoint) => {
      expect(screen.getByText(endpoint.name)).toBeInTheDocument()
      expect(screen.getByText(endpoint.url)).toBeInTheDocument()
    })
  })

  it('should render backend type labels', () => {
    renderComponent()

    expect(screen.getByText('OSS server')).toBeInTheDocument()
    expect(screen.getByText('Redis Cloud')).toBeInTheDocument()
  })

  it('should render edit and delete controls for each endpoint', () => {
    renderComponent()

    mockedEndpoints.forEach((endpoint) => {
      expect(
        screen.getByTestId(`edit-endpoint-${endpoint.id}`),
      ).toBeInTheDocument()
      expect(
        screen.getByTestId(`delete-endpoint-${endpoint.id}-icon`),
      ).toBeInTheDocument()
    })
  })

  it('should call onEdit with the endpoint when edit button is clicked', () => {
    const onEdit = jest.fn()
    renderComponent({ onEdit })

    fireEvent.click(
      screen.getByTestId(`edit-endpoint-${mockedEndpoints[0].id}`),
    )

    expect(onEdit).toHaveBeenCalledWith(mockedEndpoints[0])
  })

  it('should not call onConnect when edit button is clicked', () => {
    const onConnect = jest.fn()
    renderComponent({ onConnect })

    fireEvent.click(
      screen.getByTestId(`edit-endpoint-${mockedEndpoints[0].id}`),
    )

    expect(onConnect).not.toHaveBeenCalled()
  })

  it('should dispatch deleteEndpointsAction when deletion is confirmed', async () => {
    const endpoint = mockedEndpoints[0]
    const { store } = renderComponent()

    fireEvent.click(screen.getByTestId(`delete-endpoint-${endpoint.id}-icon`))
    fireEvent.click(await screen.findByTestId(`delete-endpoint-${endpoint.id}`))

    expect(deleteEndpointsAction).toHaveBeenCalledWith(
      [endpoint],
      expect.any(Function),
    )
    expect(store.getActions()).toEqual(
      expect.arrayContaining([{ type: 'DELETE_ENDPOINTS' }]),
    )
  })
})
