import React from 'react'
import { cloneDeep } from 'lodash'
import { faker } from '@faker-js/faker'

import type { RootState } from 'uiSrc/slices/store'
import { fetchConfigurationAction } from 'uiSrc/slices/agentMemory/workspace'
import { AgentMemoryConfiguration } from 'uiSrc/slices/interfaces/agentMemory'
import {
  cleanup,
  initialStateDefault,
  mockStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'

import ConfigurationPanel, {
  ConfigurationPanelProps,
} from './ConfigurationPanel'

jest.mock('uiSrc/slices/agentMemory/workspace', () => ({
  ...jest.requireActual('uiSrc/slices/agentMemory/workspace'),
  fetchConfigurationAction: jest.fn(() => ({ type: 'FETCH_CONFIGURATION' })),
}))

const mockedConfiguration: AgentMemoryConfiguration = {
  serviceName: faker.lorem.words(2),
  storeId: faker.string.uuid(),
  database: faker.lorem.word(),
  endpoint: faker.internet.url(),
  shortTermTtl: '1 hour',
  longTermTtl: '30 days',
}

interface StateOverrides {
  data?: AgentMemoryConfiguration | null
  loading?: boolean
}

const createStore = (overrides: StateOverrides = {}) => {
  const state = cloneDeep(initialStateDefault) as RootState

  state.agentMemory.workspace.configuration.data = overrides.data ?? null
  state.agentMemory.workspace.configuration.loading = overrides.loading ?? false

  return mockStore(state)
}

describe('ConfigurationPanel', () => {
  const defaultProps: ConfigurationPanelProps = {
    endpointId: faker.string.uuid(),
  }

  const renderComponent = (
    propsOverride?: Partial<ConfigurationPanelProps>,
    stateOverrides: StateOverrides = {},
  ) => {
    const props = { ...defaultProps, ...propsOverride }
    const store = createStore(stateOverrides)

    return {
      store,
      ...render(<ConfigurationPanel {...props} />, { store }),
    }
  }

  beforeEach(() => {
    cleanup()
    jest.clearAllMocks()
  })

  it('should render', () => {
    expect(renderComponent()).toBeTruthy()
  })

  it('should fetch the configuration on mount', () => {
    const { store } = renderComponent()

    expect(fetchConfigurationAction).toHaveBeenCalledWith(
      defaultProps.endpointId,
    )
    expect(store.getActions()).toEqual(
      expect.arrayContaining([{ type: 'FETCH_CONFIGURATION' }]),
    )
  })

  it('should render configuration rows from the store', () => {
    renderComponent(undefined, { data: mockedConfiguration })

    expect(screen.getByTestId('config-service-name')).toHaveTextContent(
      mockedConfiguration.serviceName as string,
    )
    expect(screen.getByTestId('config-store-id')).toHaveTextContent(
      mockedConfiguration.storeId as string,
    )
    expect(screen.getByTestId('config-database')).toHaveTextContent(
      mockedConfiguration.database as string,
    )
    expect(screen.getByTestId('config-endpoint')).toHaveTextContent(
      mockedConfiguration.endpoint as string,
    )
    expect(screen.getByTestId('config-short-term-ttl')).toHaveTextContent(
      mockedConfiguration.shortTermTtl as string,
    )
    expect(screen.getByTestId('config-long-term-ttl')).toHaveTextContent(
      mockedConfiguration.longTermTtl as string,
    )
  })

  it('should render an em dash for values the backend does not expose', () => {
    renderComponent(undefined, {
      data: { serviceName: mockedConfiguration.serviceName },
    })

    expect(screen.getByTestId('config-store-id')).toHaveTextContent('—')
    expect(screen.getByTestId('config-database')).toHaveTextContent('—')
    expect(screen.getByTestId('config-endpoint')).toHaveTextContent('—')
  })

  it('should render a note when no TTL configuration is exposed', () => {
    renderComponent(undefined, {
      data: { serviceName: mockedConfiguration.serviceName },
    })

    expect(
      screen.getByText(
        'TTL configuration is not exposed by this agent memory server.',
      ),
    ).toBeInTheDocument()
  })

  it('should not render the TTL note while loading', () => {
    renderComponent(undefined, { data: null, loading: true })

    expect(
      screen.queryByText(
        'TTL configuration is not exposed by this agent memory server.',
      ),
    ).toBeNull()
  })

  it('should not render the TTL note when TTLs are configured', () => {
    renderComponent(undefined, { data: mockedConfiguration })

    expect(
      screen.queryByText(
        'TTL configuration is not exposed by this agent memory server.',
      ),
    ).toBeNull()
  })
})
