import { cloneDeep, set } from 'lodash'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { instance, mock } from 'ts-mockito'
import { faker } from '@faker-js/faker'
import { http, HttpResponse } from 'msw'

import { waitFor, within } from '@testing-library/react'
import {
  cleanup,
  mockedStore,
  render,
  act,
  mockStore,
  initialStateDefault,
  getMswURL,
} from 'uiSrc/utils/test-utils'
import { mswServer } from 'uiSrc/mocks/server'
import { resetKeys, resetPatternKeysData } from 'uiSrc/slices/browser/keys'
import { setMonitorInitialState } from 'uiSrc/slices/cli/monitor'
import { setInitialPubSubState } from 'uiSrc/slices/pubsub/pubsub'
import { setBulkActionsInitialState } from 'uiSrc/slices/browser/bulkActions'
import {
  appContextSelector,
  setAppContextConnectedInstanceId,
  setAppContextInitialState,
  setDbConfig,
} from 'uiSrc/slices/app/context'
import * as appFeaturesSlice from 'uiSrc/slices/app/features'
import {
  resetCliHelperSettings,
  resetCliSettings,
} from 'uiSrc/slices/cli/cli-settings'
import {
  resetRedisearchKeysData,
  setRedisearchInitialState,
} from 'uiSrc/slices/browser/redisearch'
import { setClusterDetailsInitialState } from 'uiSrc/slices/analytics/clusterDetails'
import { setDatabaseAnalysisInitialState } from 'uiSrc/slices/analytics/dbAnalysis'
import { setInitialAnalyticsSettings } from 'uiSrc/slices/analytics/settings'
import {
  getRecommendations,
  setInitialRecommendationsState,
} from 'uiSrc/slices/recommendations/recommendations'
import {
  getDatabaseConfigInfo,
  loadInstances,
  resetConnectedInstance,
  setConnectedInfoInstance,
  setConnectedInstance,
  setDefaultInstance,
  setDefaultInstanceFailure,
  setDefaultInstanceSuccess,
} from 'uiSrc/slices/instances/instances'
import * as rdiInstanceSlice from 'uiSrc/slices/rdi/instances'
import { loadInstances as loadRdiInstances } from 'uiSrc/slices/rdi/instances'

import { clearExpertChatHistory } from 'uiSrc/slices/panels/aiAssistant'
import { setConnectivityError } from 'uiSrc/slices/app/connectivity'
import { getAllPlugins } from 'uiSrc/slices/app/plugins'
import { ApiEndpoints, DEFAULT_RDI_SHOWN_COLUMNS, FeatureFlags } from 'uiSrc/constants'
import {
  connectDatabaseApiSpy,
  getDatabasesApiSpy,
} from 'uiSrc/mocks/handlers/instances/instancesHandlers'
import { RdiInstance } from 'uiSrc/slices/interfaces'
import InstancePage, { Props } from './InstancePage'

const INSTANCE_ID_MOCK = 'instanceId'
const mockedProps = mock<Props>()

const instanceDataActions = [
  setConnectedInstance(),
  getDatabaseConfigInfo(),
  setConnectedInfoInstance(),
  getRecommendations(),
]

jest.mock('uiSrc/services', () => ({
  localStorageService: {
    set: jest.fn(),
    get: jest.fn(),
  },
}))

jest.mock('uiSrc/slices/app/context', () => ({
  ...jest.requireActual('uiSrc/slices/app/context'),
  appContextSelector: jest.fn().mockReturnValue({
    contextInstanceId: INSTANCE_ID_MOCK,
  }),
}))

let store: typeof mockedStore
beforeEach(() => {
  jest
    .spyOn(appFeaturesSlice, 'appFeatureFlagsFeaturesSelector')
    .mockReturnValue({
      insightsRecommendations: {
        flag: false,
      },
      envDependent: {
        flag: true,
      },
    })

  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
  getDatabasesApiSpy.mockClear()
  connectDatabaseApiSpy.mockClear()
  connectDatabaseApiSpy.mockImplementation(async () =>
    HttpResponse.text('', { status: 200 }),
  )
})

/**
 * InstancePage tests
 *
 * @group component
 */
describe('InstancePage', () => {
  it('should render', () => {
    expect(
      render(
        <BrowserRouter>
          <InstancePage {...instance(mockedProps)} />
        </BrowserRouter>,
      ),
    ).toBeTruthy()
  })

  it('should render with CLI Header Minimized Component', () => {
    const { queryByTestId } = render(
      <BrowserRouter>
        <InstancePage {...instance(mockedProps)} />
      </BrowserRouter>,
    )

    expect(queryByTestId('expand-cli')).toBeInTheDocument()
  })

  it('should call proper actions with resetting context', async () => {
    const prevInstanceId = faker.string.uuid()
    ;(appContextSelector as jest.Mock).mockReturnValue({
      contextInstanceId: prevInstanceId,
    })

    // Seed a different already-connected DB so InstancePage resets on switch
    // (Redis Stack keeps the same id and must not reset).
    const initialState = set(
      cloneDeep(initialStateDefault),
      'connections.instances.connectedInstance.id',
      prevInstanceId,
    )
    const testStore = mockStore(initialState)

    // Flush pending async thunks leaked from previous test renders
    await act(async () => {})
    testStore.clearActions()

    await act(() => {
      render(
        <BrowserRouter>
          <InstancePage {...instance(mockedProps)} />
        </BrowserRouter>,
        {
          store: testStore,
        },
      )
    })

    const resetContextActions = [
      resetKeys(),
      setMonitorInitialState(),
      setInitialPubSubState(),
      setBulkActionsInitialState(),
      setAppContextInitialState(),
      resetPatternKeysData(),
      resetCliHelperSettings(),
      resetCliSettings(),
      resetRedisearchKeysData(),
      setClusterDetailsInitialState(),
      setDatabaseAnalysisInitialState(),
      setInitialAnalyticsSettings(),
      setRedisearchInitialState(),
      setInitialRecommendationsState(),
    ]

    const expectedActions = [
      loadInstances(),
      loadRdiInstances(),
      getAllPlugins(),
      setDefaultInstance(),
      resetConnectedInstance(),
      ...resetContextActions,
      clearExpertChatHistory(),
      setConnectivityError(null),
      setAppContextConnectedInstanceId(INSTANCE_ID_MOCK),
      setDbConfig(undefined),
    ]

    expect(testStore.getActions().slice(0, expectedActions.length)).toEqual(
      expectedActions,
    )
  })

  it('should load instance data without connect when already connected to same id', async () => {
    ;(appContextSelector as jest.Mock).mockReturnValue({
      contextInstanceId: '',
    })

    const initialState = set(
      cloneDeep(initialStateDefault),
      'connections.instances.connectedInstance.id',
      INSTANCE_ID_MOCK,
    )
    const testStore = mockStore(initialState)

    await act(async () => {})
    testStore.clearActions()

    await act(() => {
      render(
        <BrowserRouter>
          <InstancePage {...instance(mockedProps)} />
        </BrowserRouter>,
        {
          store: testStore,
        },
      )
    })

    expect(connectDatabaseApiSpy).not.toHaveBeenCalled()
    expect(testStore.getActions()).not.toContainEqual(resetConnectedInstance())

    await waitFor(() =>
      expect(testStore.getActions()).toEqual(
        expect.arrayContaining(instanceDataActions),
      ),
    )
  })

  it('should load instance data after successful connect', async () => {
    ;(appContextSelector as jest.Mock).mockReturnValue({
      contextInstanceId: '',
    })

    const testStore = mockStore(cloneDeep(initialStateDefault))

    await act(async () => {})
    testStore.clearActions()

    await act(() => {
      render(
        <BrowserRouter>
          <InstancePage {...instance(mockedProps)} />
        </BrowserRouter>,
        {
          store: testStore,
        },
      )
    })

    await waitFor(() => {
      expect(connectDatabaseApiSpy).toHaveBeenCalled()
      expect(testStore.getActions()).toEqual(
        expect.arrayContaining([
          setDefaultInstanceSuccess(),
          ...instanceDataActions,
        ]),
      )
    })
  })

  it('should load instance data after failed connect', async () => {
    ;(appContextSelector as jest.Mock).mockReturnValue({
      contextInstanceId: '',
    })

    mswServer.use(
      http.get(
        getMswURL(`${ApiEndpoints.DATABASES}/:id/connect`),
        async () =>
          HttpResponse.json(
            { message: 'Service Unavailable' },
            { status: 503 },
          ),
      ),
    )

    const testStore = mockStore(cloneDeep(initialStateDefault))

    await act(async () => {})
    testStore.clearActions()

    await act(() => {
      render(
        <BrowserRouter>
          <InstancePage {...instance(mockedProps)} />
        </BrowserRouter>,
        {
          store: testStore,
        },
      )
    })

    await waitFor(() => {
      expect(testStore.getActions()).toEqual(
        expect.arrayContaining([
          setDefaultInstanceFailure('Service Unavailable'),
          ...instanceDataActions,
        ]),
      )
    })
  })

  it('should connect once on fresh deep link without resetting', async () => {
    ;(appContextSelector as jest.Mock).mockReturnValue({
      contextInstanceId: '',
    })

    const initialState = set(
      cloneDeep(initialStateDefault),
      'connections.instances.connectedInstance.id',
      '',
    )
    const testStore = mockStore(initialState)

    await act(async () => {})
    testStore.clearActions()
    connectDatabaseApiSpy.mockClear()

    await act(() => {
      render(
        <BrowserRouter>
          <InstancePage {...instance(mockedProps)} />
        </BrowserRouter>,
        {
          store: testStore,
        },
      )
    })

    await waitFor(() => expect(connectDatabaseApiSpy).toHaveBeenCalledTimes(1))
    expect(testStore.getActions()).not.toContainEqual(resetConnectedInstance())
  })

  it('should call databases list api', async () => {
    ;(appContextSelector as jest.Mock).mockReturnValue({
      contextInstanceId: 'prevId',
    })

    const initialState = set(
      cloneDeep(initialStateDefault),
      `app.features.featureFlags.features.${FeatureFlags.envDependent}`,
      { flag: true },
    )

    await act(() => {
      render(
        <BrowserRouter>
          <InstancePage {...instance(mockedProps)} />
        </BrowserRouter>,
        {
          store: mockStore(initialState),
        },
      )
    })

    await waitFor(() => expect(getDatabasesApiSpy).toHaveBeenCalledTimes(1))
  })

  it('should not call databases list api when flag disabled', async () => {
    ;(appContextSelector as jest.Mock).mockReturnValue({
      contextInstanceId: 'prevId',
    })

    const initialState = set(
      cloneDeep(initialStateDefault),
      `app.features.featureFlags.features.${FeatureFlags.envDependent}`,
      { flag: false },
    )

    await act(() => {
      render(
        <BrowserRouter>
          <InstancePage {...instance(mockedProps)} />
        </BrowserRouter>,
        {
          store: mockStore(initialState),
        },
      )
    })

    await waitFor(() => expect(getDatabasesApiSpy).toHaveBeenCalledTimes(0))
  })

  it('should not render connectivity error page when envDependent feature flag is on', () => {
    const initialState = set(
      cloneDeep(initialStateDefault),
      'app.connectivity',
      {
        loading: false,
        error: 'Test error',
      },
    )

    const { queryByTestId } = render(
      <BrowserRouter>
        <InstancePage {...instance(mockedProps)} />
      </BrowserRouter>,
      {
        store: mockStore(initialState),
      },
    )

    expect(queryByTestId('connectivity-error-message')).not.toBeInTheDocument()
  })

  it('should render connectivity error page when error occurs and flag is off', () => {
    jest
      .spyOn(appFeaturesSlice, 'appFeatureFlagsFeaturesSelector')
      .mockReturnValue({
        insightsRecommendations: {
          flag: false,
        },
        envDependent: {
          flag: false,
        },
      })

    const initialState = set(
      cloneDeep(initialStateDefault),
      'app.connectivity',
      {
        loading: false,
        error: 'Test error',
      },
    )

    const { getByTestId } = render(
      <BrowserRouter>
        <InstancePage {...instance(mockedProps)} />
      </BrowserRouter>,
      {
        store: mockStore(initialState),
      },
    )

    const { getByText } = within(getByTestId('connectivity-error-message'))
    expect(getByText('Test error')).toBeInTheDocument()
  })

  it('should dispatch fetchRdiInstancesAction when rdiInstances is empty and envDependent flag is true', async () => {
    jest.spyOn(rdiInstanceSlice, 'instancesSelector').mockReturnValue({
      data: [],
      loading: false,
      error: '',
      connectedInstance: {} as unknown as RdiInstance,
      loadingChanging: false,
      errorChanging: '',
      changedSuccessfully: false,
      isPipelineLoaded: false,
    })
    const mockFetchInstancesAction = jest.fn()
    jest
      .spyOn(rdiInstanceSlice, 'fetchInstancesAction')
      .mockImplementation(() => mockFetchInstancesAction)

    jest
      .spyOn(appFeaturesSlice, 'appFeatureFlagsFeaturesSelector')
      .mockReturnValue({
        [FeatureFlags.envDependent]: { flag: true },
      })

    await act(async () => {
      render(
        <BrowserRouter>
          <InstancePage {...instance(mockedProps)} />
        </BrowserRouter>,
        { store: mockStore(initialStateDefault) },
      )
    })

    expect(mockFetchInstancesAction).toHaveBeenCalled()
  })

  it('should not dispatch fetchRdiInstancesAction when envDependent flag is false', async () => {
    jest.spyOn(rdiInstanceSlice, 'instancesSelector').mockReturnValue({
      data: [],
      loading: false,
      error: '',
      connectedInstance: {} as unknown as RdiInstance,
      loadingChanging: false,
      errorChanging: '',
      changedSuccessfully: false,
      shownColumns: DEFAULT_RDI_SHOWN_COLUMNS,
    })
    const mockFetchInstancesAction = jest.fn()
    jest
      .spyOn(rdiInstanceSlice, 'fetchInstancesAction')
      .mockImplementation(() => mockFetchInstancesAction)

    jest
      .spyOn(appFeaturesSlice, 'appFeatureFlagsFeaturesSelector')
      .mockReturnValue({
        [FeatureFlags.envDependent]: { flag: false },
      })

    await act(async () => {
      render(
        <BrowserRouter>
          <InstancePage {...instance(mockedProps)} />
        </BrowserRouter>,
        { store: mockStore(initialStateDefault) },
      )
    })

    expect(mockFetchInstancesAction).not.toHaveBeenCalled()
  })
})
