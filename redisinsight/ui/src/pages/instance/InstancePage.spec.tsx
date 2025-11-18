import { cloneDeep, set } from 'lodash'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { instance, mock } from 'ts-mockito'

import { waitFor, within } from '@testing-library/react'
import {
  cleanup,
  mockedStore,
  render,
  act,
  mockStore,
  initialStateDefault,
} from 'uiSrc/utils/test-utils'
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
  setConnectedInfoInstance,
  setConnectedInstance,
  setDefaultInstance,
} from 'uiSrc/slices/instances/instances'
import * as rdiInstanceSlice from 'uiSrc/slices/rdi/instances'
import { loadInstances as loadRdiInstances } from 'uiSrc/slices/rdi/instances'

import { clearExpertChatHistory } from 'uiSrc/slices/panels/aiAssistant'
import { getAllPlugins } from 'uiSrc/slices/app/plugins'
import { DEFAULT_RDI_SHOWN_COLUMNS, FeatureFlags } from 'uiSrc/constants'
import { getDatabasesApiSpy } from 'uiSrc/mocks/handlers/instances/instancesHandlers'
import { RdiInstance } from 'uiSrc/slices/interfaces'
import InstancePage, { Props } from './InstancePage'

const INSTANCE_ID_MOCK = 'instanceId'
const mockedProps = mock<Props>()

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
    ;(appContextSelector as jest.Mock).mockReturnValue({
      contextInstanceId: 'prevId',
    })

    await act(() => {
      render(
        <BrowserRouter>
          <InstancePage {...instance(mockedProps)} />
        </BrowserRouter>,
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
      setConnectedInstance(),
      getDatabaseConfigInfo(),
      setConnectedInfoInstance(),
      getRecommendations(),
      ...resetContextActions,
      clearExpertChatHistory(),
      setAppContextConnectedInstanceId(INSTANCE_ID_MOCK),
      setDbConfig(undefined),
    ]

    expect(store.getActions().slice(0, expectedActions.length)).toEqual(
      expectedActions,
    )
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
