import { filter, first, get, isNull, map, orderBy } from 'lodash'
import { createSlice } from '@reduxjs/toolkit'
import axios, { AxiosError } from 'axios'

import ApiErrors from 'uiSrc/constants/apiErrors'
import {
  instancesService,
  localStorageService,
  sessionStorageService,
} from 'uiSrc/services'
import {
  BrowserStorageItem,
  COLUMN_FIELD_NAME_MAP,
  CustomErrorCodes,
  DatabaseListColumn,
} from 'uiSrc/constants'
import { setAppContextInitialState } from 'uiSrc/slices/app/context'
import { resetKeys } from 'uiSrc/slices/browser/keys'
import successMessages from 'uiSrc/components/notifications/success-messages'
import { checkRediStack, getApiErrorMessage, Nullable } from 'uiSrc/utils'
import {
  INFINITE_MESSAGES,
  InfiniteMessagesIds,
} from 'uiSrc/components/notifications/components'
import { Database as DatabaseInstanceResponse } from 'apiSrc/modules/database/models/database'
import { RedisNodeInfoResponse } from 'apiSrc/modules/database/dto/redis-info.dto'
import { ExportDatabase } from 'apiSrc/modules/database/models/export-database'

import { fetchMastersSentinelAction } from './sentinel'
import { fetchTags } from './tags'
import { AppDispatch, RootState } from '../store'
import {
  addErrorNotification,
  addInfiniteNotification,
  addMessageNotification,
  removeInfiniteNotification,
} from '../app/notifications'
import { ConnectionType, InitialStateInstances, Instance } from '../interfaces'

const HIDE_CREATING_DB_DELAY_MS = 500

export const initialState: InitialStateInstances = {
  loading: false,
  error: '',
  data: [],
  loadingChanging: false,
  errorChanging: '',
  changedSuccessfully: false,
  deletedSuccessfully: false,
  freeInstances: [],
  connectedInstance: {
    id: '',
    name: '',
    host: '',
    port: 0,
    version: '',
    nameFromProvider: '',
    lastConnection: new Date(),
    connectionType: ConnectionType.Standalone,
    isRediStack: false,
    modules: [],
    loading: false,
  },
  editedInstance: {
    loading: false,
    error: '',
    data: null,
  },
  instanceOverview: {
    version: '',
  },
  instanceInfo: {
    version: '',
    server: {},
  },
  importInstances: {
    loading: false,
    error: '',
    data: null,
  },
  shownColumns: [...COLUMN_FIELD_NAME_MAP.keys()],
}

// A slice for recipes
const instancesSlice = createSlice({
  name: 'instances',
  initialState,
  reducers: {
    // load instances
    loadInstances: (state) => {
      state.loading = true
      state.error = ''
    },
    loadInstancesSuccess: (
      state,
      { payload }: { payload: DatabaseInstanceResponse[] },
    ) => {
      state.data = checkRediStack(payload)
      state.loading = false
      state.freeInstances =
        (filter(
          [...orderBy(payload, 'lastConnection', 'desc')],
          'cloudDetails.free',
        ) as unknown as Instance[]) || null
      if (state.connectedInstance.id) {
        const isRediStack = state.data.find(
          (db) => db.id === state.connectedInstance.id,
        )?.isRediStack
        state.connectedInstance.isRediStack = isRediStack || false
      }
    },
    loadInstancesFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },

    // add/edit instance
    defaultInstanceChanging: (state) => {
      state.loadingChanging = true
      state.changedSuccessfully = false
      state.errorChanging = ''
    },
    defaultInstanceChangingSuccess: (state) => {
      state.changedSuccessfully = true
      state.loadingChanging = false
    },
    defaultInstanceChangingFailure: (state, { payload = '' }) => {
      state.loadingChanging = false
      state.changedSuccessfully = false
      state.errorChanging = payload.toString()
    },

    // test database connection
    testConnection: (state) => {
      state.loadingChanging = true
      state.errorChanging = ''
    },
    testConnectionSuccess: (state) => {
      state.loadingChanging = false
    },
    testConnectionFailure: (state, { payload = '' }) => {
      state.loadingChanging = false
      state.errorChanging = payload.toString()
    },

    changeInstanceAlias: (state) => {
      state.loadingChanging = true
      state.errorChanging = ''
    },
    changeInstanceAliasSuccess: (state, { payload }) => {
      const { id, name } = payload
      state.data = state.data.map((item: Instance) => {
        if (item.id === id) {
          item.name = name
        }
        return item
      })
      state.loadingChanging = false
    },
    changeInstanceAliasFailure: (state, { payload = '' }) => {
      state.loadingChanging = false
      state.errorChanging = payload.toString()
    },

    resetInstanceUpdate: (state) => {
      state.loadingChanging = false
    },

    // delete instances
    setDefaultInstance: (state) => {
      state.loading = true
      state.error = ''
    },
    setDefaultInstanceSuccess: (state) => {
      state.loading = false
    },
    setDefaultInstanceFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    getDatabaseConfigInfo: (state) => {
      state.error = ''
    },
    getDatabaseConfigInfoSuccess: (state, { payload }) => {
      state.instanceOverview = {
        ...payload,
        version: payload?.version || state.instanceOverview.version || '',
      }
    },
    getDatabaseConfigInfoFailure: (state, { payload }) => {
      state.error = payload
    },

    // set connected instance id
    setConnectedInstanceId: (state, { payload }: { payload: string }) => {
      state.connectedInstance = {
        ...state.connectedInstance,
        id: payload,
      }
    },

    // set connected instance
    setConnectedInstance: (state) => {
      state.connectedInstance.loading = true
    },

    // set connected instance success
    setConnectedInstanceSuccess: (
      state,
      { payload }: { payload: Instance },
    ) => {
      const isRediStack = state.data?.find(
        (db) => db.id === state.connectedInstance.id,
      )?.isRediStack
      state.connectedInstance = payload
      state.connectedInstance.loading = false
      state.connectedInstance.isRediStack = isRediStack || false
      state.connectedInstance.isFreeDb = payload.cloudDetails?.free || false
      state.connectedInstance.db =
        sessionStorageService.get(
          `${BrowserStorageItem.dbIndex}${payload.id}`,
        ) ?? payload.db
    },

    setConnectedInfoInstance: (state) => {
      state.instanceInfo = initialState.instanceInfo
    },

    setConnectedInfoInstanceSuccess: (
      state,
      { payload }: { payload: RedisNodeInfoResponse },
    ) => {
      state.instanceInfo = payload
    },

    // set edited instance
    setEditedInstance: (
      state,
      { payload }: { payload: Nullable<Instance> },
    ) => {
      state.editedInstance.data = payload
    },

    updateEditedInstance: (
      state,
      { payload }: { payload: Nullable<Instance> },
    ) => {
      if (isNull(state.editedInstance.data)) {
        state.editedInstance.data = payload
      } else {
        state.editedInstance.data = {
          ...state.editedInstance.data,
          ...payload,
        }
      }
    },

    setConnectedInstanceFailure: (state) => {
      state.connectedInstance.loading = false
    },

    // reset connected instance
    resetConnectedInstance: (state) => {
      state.connectedInstance = initialState.connectedInstance
    },

    importInstancesFromFile: (state) => {
      state.importInstances.loading = true
      state.importInstances.error = ''
    },

    importInstancesFromFileSuccess: (state, { payload }) => {
      state.importInstances.loading = false
      state.importInstances.data = payload
    },

    importInstancesFromFileFailure: (state, { payload }) => {
      state.importInstances.loading = false
      state.importInstances.error = payload
    },

    resetImportInstances: (state) => {
      state.importInstances = initialState.importInstances
    },

    checkDatabaseIndex: (state) => {
      state.connectedInstance.loading = true
    },
    checkDatabaseIndexSuccess: (state, { payload }) => {
      state.connectedInstance.db = payload
      state.connectedInstance.loading = false

      sessionStorageService.set(
        `${BrowserStorageItem.dbIndex}${state.connectedInstance.id}`,
        payload,
      )
    },
    checkDatabaseIndexFailure: (state) => {
      state.connectedInstance.loading = false
    },
    setShownColumns: (
      state,
      { payload }: { payload: DatabaseListColumn[] },
    ) => {
      state.shownColumns = [...payload]
    },
  },
})

// Actions generated from the slice
export const {
  loadInstances,
  loadInstancesSuccess,
  loadInstancesFailure,
  defaultInstanceChanging,
  defaultInstanceChangingSuccess,
  defaultInstanceChangingFailure,
  testConnection,
  testConnectionSuccess,
  testConnectionFailure,
  setDefaultInstance,
  setDefaultInstanceSuccess,
  setDefaultInstanceFailure,
  setConnectedInstanceSuccess,
  setConnectedInstanceFailure,
  setConnectedInstance,
  setConnectedInstanceId,
  resetConnectedInstance,
  getDatabaseConfigInfo,
  getDatabaseConfigInfoSuccess,
  getDatabaseConfigInfoFailure,
  changeInstanceAlias,
  changeInstanceAliasSuccess,
  changeInstanceAliasFailure,
  resetInstanceUpdate,
  setEditedInstance,
  updateEditedInstance,
  importInstancesFromFile,
  importInstancesFromFileSuccess,
  importInstancesFromFileFailure,
  resetImportInstances,
  checkDatabaseIndex,
  checkDatabaseIndexSuccess,
  checkDatabaseIndexFailure,
  setConnectedInfoInstance,
  setConnectedInfoInstanceSuccess,
  setShownColumns,
} = instancesSlice.actions

// selectors
export const instancesSelector = (state: RootState) =>
  state.connections.instances
export const freeInstancesSelector = (state: RootState) =>
  state.connections.instances.freeInstances
export const connectedInstanceSelector = (state: RootState) =>
  state.connections.instances.connectedInstance
export const connectedInstanceCDSelector = (state: RootState) =>
  state.connections.instances.connectedInstance.cloudDetails
export const connectedInstanceInfoSelector = (state: RootState) =>
  state.connections.instances.instanceInfo
export const editedInstanceSelector = (state: RootState) =>
  state.connections.instances.editedInstance
export const connectedInstanceOverviewSelector = (state: RootState) =>
  state.connections.instances.instanceOverview
export const importInstancesSelector = (state: RootState) =>
  state.connections.instances.importInstances

// The reducer
export default instancesSlice.reducer

// Asynchronous thunk action
export function fetchInstancesAction(onSuccess?: (data: Instance[]) => void) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    const envDependentFeature = get(stateInit(), [
      'app',
      'features',
      'featureFlags',
      'features',
      'envDependent',
    ])

    if (!envDependentFeature?.flag) {
      return
    }

    dispatch(loadInstances())

    try {
      const data = await instancesService.listDatabases()

      if (data !== null) {
        localStorageService.set(BrowserStorageItem.instancesCount, data?.length)
        onSuccess?.(data as Instance[])
        dispatch(loadInstancesSuccess(data))
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(loadInstancesFailure(errorMessage))
      dispatch(addErrorNotification(error))

      localStorageService.set(BrowserStorageItem.instancesCount, '0')
    }
  }
}

// Asynchronous thunk action
export function createInstanceStandaloneAction(
  payload: Instance,
  onRedirectToSentinel?: () => void,
  onSuccess?: (id: string) => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(defaultInstanceChanging())

    try {
      const data = await instancesService.createInstance(payload)

      if (data !== null) {
        dispatch(defaultInstanceChangingSuccess())
        dispatch<any>(fetchInstancesAction())

        dispatch(
          addMessageNotification(
            successMessages.ADDED_NEW_INSTANCE(payload.name ?? ''),
          ),
        )
        onSuccess?.(data.id)
      }
    } catch (_error) {
      const error = _error as AxiosError
      const errorMessage = getApiErrorMessage(error)
      const errorCode = get(
        error,
        'response.data.errorCode',
        0,
      ) as CustomErrorCodes

      if (errorCode === CustomErrorCodes.DatabaseAlreadyExists) {
        const databaseId: string = get(
          error,
          'response.data.resource.databaseId',
          '',
        )

        dispatch(
          autoCreateAndConnectToInstanceActionSuccess(
            databaseId,
            successMessages.DATABASE_ALREADY_EXISTS(),
            () => {
              dispatch(defaultInstanceChangingSuccess())
              onSuccess?.(databaseId)
            },
            () => {
              dispatch(defaultInstanceChangingFailure(errorMessage))
            },
          ),
        )
        return
      }

      dispatch(defaultInstanceChangingFailure(errorMessage))

      if (error?.response?.data?.error === ApiErrors.SentinelParamsRequired) {
        checkoutToSentinelFlow(payload, dispatch, onRedirectToSentinel)
        return
      }

      dispatch(addErrorNotification(error))
    }
  }
}

// Asynchronous thunk action
export function autoCreateAndConnectToInstanceAction(
  payload: Instance,
  onSuccess?: (id: string) => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(
      addInfiniteNotification(INFINITE_MESSAGES.AUTO_CREATING_DATABASE()),
    )

    try {
      const data = await instancesService.createInstance(payload)

      if (data !== null) {
        await dispatch(
          autoCreateAndConnectToInstanceActionSuccess(
            data?.id,
            successMessages.ADDED_NEW_INSTANCE(data?.name),
            onSuccess,
          ),
        )
      }
    } catch (error) {
      const errorCode = get(
        error,
        'response.data.errorCode',
        0,
      ) as CustomErrorCodes

      if (errorCode === CustomErrorCodes.DatabaseAlreadyExists) {
        const databaseId = get(error, 'response.data.resource.databaseId', '')

        dispatch(
          autoCreateAndConnectToInstanceActionSuccess(
            databaseId,
            successMessages.DATABASE_ALREADY_EXISTS(),
            onSuccess,
          ),
        )
        return
      }
      dispatch(addErrorNotification(error as AxiosError))
      dispatch(removeInfiniteNotification(InfiniteMessagesIds.autoCreateDb))
    }
  }
}

function autoCreateAndConnectToInstanceActionSuccess(
  id: string,
  message: any,
  onSuccess?: (id: string) => void,
  onFail?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    try {
      const state = stateInit()
      const isConnectedId = state.app?.context?.contextInstanceId === id
      if (!isConnectedId) {
        dispatch(resetKeys())
        dispatch(setAppContextInitialState())
        dispatch(setConnectedInstanceId(id ?? ''))
      }
      dispatch(
        checkConnectToInstanceAction(
          id,
          (id) => {
            setTimeout(() => {
              dispatch(
                removeInfiniteNotification(InfiniteMessagesIds.autoCreateDb),
              )
              dispatch(addMessageNotification(message))
              onSuccess?.(id)
            }, HIDE_CREATING_DB_DELAY_MS)
          },
          () => {
            dispatch(
              removeInfiniteNotification(InfiniteMessagesIds.autoCreateDb),
            )
            onFail?.()
          },
          !isConnectedId,
        ),
      )
    } catch (error) {
      // process error if needed
    }
  }
}

export type PartialInstance = Partial<Omit<Instance, 'tags'>> & {
  tags?: {
    key: string
    value: string
  }[]
}

// Asynchronous thunk action
export function updateInstanceAction(
  { id, ...payload }: PartialInstance,
  onSuccess?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(defaultInstanceChanging())

    try {
      const result = await instancesService.updateInstance(id!, payload)

      if (result) {
        dispatch(defaultInstanceChangingSuccess())
        dispatch<any>(fetchInstancesAction())
        if (payload.tags) {
          dispatch(fetchTags())
        }
        onSuccess?.()
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(defaultInstanceChangingFailure(errorMessage))
      dispatch(addErrorNotification(error))
    }
  }
}

// Asynchronous thunk action
export function cloneInstanceAction(
  { id, ...payload }: Partial<Instance>,
  onSuccess?: (id?: string) => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(defaultInstanceChanging())

    try {
      const data = await instancesService.cloneInstance(id!, payload)

      if (data !== null) {
        dispatch(defaultInstanceChangingSuccess())
        dispatch<any>(fetchInstancesAction())

        dispatch(
          addMessageNotification(
            successMessages.ADDED_NEW_INSTANCE(data.name ?? ''),
          ),
        )
        onSuccess?.(id)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(defaultInstanceChangingFailure(errorMessage))
      dispatch(addErrorNotification(error))
    }
  }
}

// Asynchronous thunk action
export function deleteInstancesAction(
  instances: Instance[],
  onSuccess?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(setDefaultInstance())

    try {
      const state = stateInit()
      const databasesIds = map(instances, 'id')
      const result = await instancesService.deleteInstances(databasesIds)

      if (result) {
        dispatch(setDefaultInstanceSuccess())
        dispatch<any>(fetchInstancesAction())
        dispatch(fetchTags())

        if (databasesIds.includes(state.app.context.contextInstanceId)) {
          dispatch(resetConnectedInstance())
          dispatch(resetKeys())
          dispatch(setAppContextInitialState())
        }
        onSuccess?.()

        if (instances.length === 1) {
          dispatch(
            addMessageNotification(
              successMessages.DELETE_INSTANCE(first(instances)?.name ?? ''),
            ),
          )
        } else {
          dispatch(
            addMessageNotification(
              successMessages.DELETE_INSTANCES(map(instances, 'name')),
            ),
          )
        }
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(setDefaultInstanceFailure(errorMessage))
      dispatch(addErrorNotification(error))
    }
  }
}

// Asynchronous thunk action
export function exportInstancesAction(
  ids: string[],
  withSecrets: boolean,
  onSuccess?: (data: ExportDatabase) => void,
  onFail?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(setDefaultInstance())

    try {
      const data = await instancesService.exportInstances(ids, withSecrets)

      if (data !== null) {
        dispatch(setDefaultInstanceSuccess())

        onSuccess?.(data)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(setDefaultInstanceFailure(errorMessage))
      dispatch(addErrorNotification(error))
      onFail?.()
    }
  }
}

// Asynchronous thunk action
export function fetchConnectedInstanceAction(
  id: string,
  onSuccess?: () => void,
  onFail?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(setDefaultInstance())
    dispatch(setConnectedInstance())

    try {
      const data = await instancesService.getInstance(id)

      if (data !== null) {
        dispatch(setConnectedInstanceSuccess(data))
        dispatch(setDefaultInstanceSuccess())
      }
      onSuccess?.()
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(setDefaultInstanceFailure(errorMessage))
      dispatch(addErrorNotification(error))
      onFail?.()
    }
  }
}

// Asynchronous thunk action
export function fetchConnectedInstanceInfoAction(
  id: string,
  onSuccess?: () => void,
  onFail?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(setConnectedInfoInstance())

    try {
      const data = await instancesService.getInstanceInfo(id)

      if (data !== null) {
        dispatch(setConnectedInfoInstanceSuccess(data))
        onSuccess?.()
      } else {
        onFail?.()
      }
    } catch (error) {
      onFail?.()
    }
  }
}

// Asynchronous thunk action
export function fetchEditedInstanceAction(
  instance: Instance,
  onSuccess?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(setDefaultInstance())
    dispatch(setEditedInstance(instance))

    try {
      const data = await instancesService.getInstance(instance.id)

      if (data !== null) {
        dispatch(updateEditedInstance(data))
        dispatch(setDefaultInstanceSuccess())
      }
      onSuccess?.()
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(setEditedInstance(null))
      dispatch(setConnectedInstanceFailure())
      dispatch(setDefaultInstanceFailure(errorMessage))
      dispatch(addErrorNotification(error))
    }
  }
}

// Asynchronous thunk action
export function checkConnectToInstanceAction(
  id: string = '',
  onSuccessAction?: (id: string) => void,
  onFailAction?: () => void,
  resetInstance: boolean = true,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(setDefaultInstance())
    resetInstance && dispatch(resetConnectedInstance())
    try {
      const result = await instancesService.connectInstance(id)

      if (result) {
        dispatch(setDefaultInstanceSuccess())
        onSuccessAction?.(id)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(setDefaultInstanceFailure(errorMessage))
      dispatch(addErrorNotification({ ...error, instanceId: id }))
      onFailAction?.()
    }
  }
}

const checkoutToSentinelFlow = (
  payload: Instance,
  dispatch: AppDispatch,
  onRedirectToSentinel?: () => void,
) => {
  const payloadSentinel = { ...payload }
  delete payloadSentinel.name
  delete payloadSentinel.db

  dispatch<any>(
    fetchMastersSentinelAction(payloadSentinel, onRedirectToSentinel),
  )
}

// Asynchronous thunk action
export function getDatabaseConfigInfoAction(
  id: string,
  onSuccessAction?: (id: string) => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(getDatabaseConfigInfo())
    try {
      const data = await instancesService.getInstanceOverview(id)

      if (data !== null) {
        dispatch(getDatabaseConfigInfoSuccess(data))
        onSuccessAction?.(id)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(getDatabaseConfigInfoFailure(errorMessage))
      onFailAction?.()
    }
  }
}

// Asynchronous thunk action
export function changeInstanceAliasAction(
  id: string = '',
  name: string,
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(changeInstanceAlias())

    try {
      const result = await instancesService.updateInstanceAlias(id, name)
      if (result) {
        dispatch(changeInstanceAliasSuccess({ id, name }))
        onSuccessAction?.()
      }
    } catch (_err) {
      const error = _err as AxiosError
      if (!axios.isCancel(error)) {
        const errorMessage = getApiErrorMessage(error)
        dispatch(changeInstanceAliasFailure(errorMessage))
        dispatch(addErrorNotification(error))
        onFailAction?.()
      }
    }
  }
}

export function checkDatabaseIndexAction(
  id: string,
  index: number,
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(checkDatabaseIndex())

    try {
      const result = await instancesService.checkInstanceDbIndex(id, index)

      if (result) {
        dispatch(checkDatabaseIndexSuccess(index))
        onSuccessAction?.()
      }
    } catch (_err) {
      const error = _err as AxiosError
      dispatch(checkDatabaseIndexFailure())
      dispatch(addErrorNotification(error))
      onFailAction?.()
    }
  }
}

export function resetInstanceUpdateAction() {
  return async (dispatch: AppDispatch) => {
    dispatch(resetInstanceUpdate())
    instancesService.sourceInstance?.source?.cancel?.()
  }
}

// Asynchronous thunk action
export function uploadInstancesFile(
  file: FormData,
  onSuccessAction?: (data: any) => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(importInstancesFromFile())

    try {
      const data = await instancesService.importInstances(file)

      if (data !== null) {
        dispatch(fetchTags())
        dispatch(importInstancesFromFileSuccess(data))
        onSuccessAction?.(data)
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)
      dispatch(importInstancesFromFileFailure(errorMessage))
      onFailAction?.()
    }
  }
}

// Asynchronous thunk action
export function testInstanceStandaloneAction(
  { id, ...payload }: Partial<Instance>,
  onRedirectToSentinel?: () => void,
) {
  return async (dispatch: AppDispatch) => {
    dispatch(testConnection())
    try {
      const result = await instancesService.testInstanceConnection(id, payload)
      if (result) {
        dispatch(testConnectionSuccess())

        dispatch(addMessageNotification(successMessages.TEST_CONNECTION()))
      }
    } catch (_err) {
      const error = _err as AxiosError
      const errorMessage = getApiErrorMessage(error)

      dispatch(testConnectionFailure(errorMessage))

      if (error?.response?.data?.error === ApiErrors.SentinelParamsRequired) {
        checkoutToSentinelFlow(
          { id, ...payload },
          dispatch,
          onRedirectToSentinel,
        )
        return
      }

      dispatch(addErrorNotification(error))
    }
  }
}
