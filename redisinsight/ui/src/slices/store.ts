import { createBrowserHistory } from 'history'
import { configureStore, combineReducers } from '@reduxjs/toolkit'

import { getConfig } from 'uiSrc/config'
import instancesReducer from './instances/instances'
import caCertsReducer from './instances/caCerts'
import clientCertsReducer from './instances/clientCerts'
import clusterReducer from './instances/cluster'
import cloudReducer from './instances/cloud'
import sentinelReducer from './instances/sentinel'
import keysReducer from './browser/keys'
import stringReducer from './browser/string'
import zsetReducer from './browser/zset'
import setReducer from './browser/set'
import hashReducer from './browser/hash'
import listReducer from './browser/list'
import rejsonReducer from './browser/rejson'
import streamReducer from './browser/stream'
import bulkActionsReducer from './browser/bulkActions'
import notificationsReducer from './app/notifications'
import cliSettingsReducer from './cli/cli-settings'
import outputReducer from './cli/cli-output'
import monitorReducer from './cli/monitor'
import userSettingsReducer from './user/user-settings'
import cloudUserProfile from './user/cloud-user-profile'
import appInfoReducer from './app/info'
import appInitReducer from './app/init'
import appConnectivityReducer from './app/connectivity'
import appContextReducer from './app/context'
import appCsrfReducer from './app/csrf'
import appRedisCommandsReducer from './app/redis-commands'
import appPluginsReducer from './app/plugins'
import appsSocketConnectionReducer from './app/socket-connection'
import appFeaturesReducer from './app/features'
import appUrlHandlingReducer from './app/url-handling'
import appOauthReducer from './oauth/cloud'
import workbenchResultsReducer from './workbench/wb-results'
import workbenchTutorialsReducer from './workbench/wb-tutorials'
import workbenchCustomTutorialsReducer from './workbench/wb-custom-tutorials'
import searchAndQueryReducer from './search/searchAndQuery'
import contentCreateRedisButtonReducer from './content/create-redis-buttons'
import contentGuideLinksReducer from './content/guide-links'
import pubSubReducer from './pubsub/pubsub'
import slowLogReducer from './analytics/slowlog'
import analyticsSettingsReducer from './analytics/settings'
import clusterDetailsReducer from './analytics/clusterDetails'
import databaseAnalysisReducer from './analytics/dbAnalysis'
import redisearchReducer from './browser/redisearch'
import recommendationsReducer from './recommendations/recommendations'
import sidePanelsReducer from './panels/sidePanels'
import rdiInstancesReducer from './rdi/instances'
import rdiPipelineReducer from './rdi/pipeline'
import rdiDryRunJobReducer from './rdi/dryRun'
import rdiTestConnectionsReducer from './rdi/testConnections'
import rdiStatisticsReducer from './rdi/statistics'
import aiAssistantReducer from './panels/aiAssistant'
import appDbSettingsReducer from './app/db-settings'
import tagsReducer from './instances/tags'

const riConfig = getConfig()

export const history = createBrowserHistory()

export const rootReducer = combineReducers({
  app: combineReducers({
    info: appInfoReducer,
    notifications: notificationsReducer,
    context: appContextReducer,
    redisCommands: appRedisCommandsReducer,
    plugins: appPluginsReducer,
    socketConnection: appsSocketConnectionReducer,
    features: appFeaturesReducer,
    urlHandling: appUrlHandlingReducer,
    csrf: appCsrfReducer,
    init: appInitReducer,
    connectivity: appConnectivityReducer,
    dbSettings: appDbSettingsReducer,
  }),
  connections: combineReducers({
    instances: instancesReducer,
    caCerts: caCertsReducer,
    clientCerts: clientCertsReducer,
    cluster: clusterReducer,
    cloud: cloudReducer,
    sentinel: sentinelReducer,
    tags: tagsReducer,
  }),
  browser: combineReducers({
    keys: keysReducer,
    string: stringReducer,
    zset: zsetReducer,
    set: setReducer,
    hash: hashReducer,
    list: listReducer,
    rejson: rejsonReducer,
    stream: streamReducer,
    bulkActions: bulkActionsReducer,
    redisearch: redisearchReducer,
  }),
  cli: combineReducers({
    settings: cliSettingsReducer,
    output: outputReducer,
    monitor: monitorReducer,
  }),
  user: combineReducers({
    settings: userSettingsReducer,
    cloudProfile: cloudUserProfile,
  }),
  workbench: combineReducers({
    results: workbenchResultsReducer,
    tutorials: workbenchTutorialsReducer,
    customTutorials: workbenchCustomTutorialsReducer,
  }),
  search: combineReducers({
    query: searchAndQueryReducer,
  }),
  content: combineReducers({
    createRedisButtons: contentCreateRedisButtonReducer,
    guideLinks: contentGuideLinksReducer,
  }),
  analytics: combineReducers({
    settings: analyticsSettingsReducer,
    slowlog: slowLogReducer,
    clusterDetails: clusterDetailsReducer,
    databaseAnalysis: databaseAnalysisReducer,
  }),
  pubsub: pubSubReducer,
  recommendations: recommendationsReducer,
  oauth: combineReducers({
    cloud: appOauthReducer,
  }),
  panels: combineReducers({
    sidePanels: sidePanelsReducer,
    aiAssistant: aiAssistantReducer,
  }),
  rdi: combineReducers({
    instances: rdiInstancesReducer,
    pipeline: rdiPipelineReducer,
    dryRun: rdiDryRunJobReducer,
    testConnections: rdiTestConnectionsReducer,
    statistics: rdiStatisticsReducer,
  }),
})

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
  devTools: riConfig.app.env !== 'production',
})

export { store }

export type ReduxStore = typeof store
export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = typeof store.dispatch
