import { cloneDeep, isNull, remove } from 'lodash'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { apiService } from 'uiSrc/services'
import { ApiEndpoints, SortOrder, KeyTypes } from 'uiSrc/constants'
import {
  bufferToString,
  getApiErrorMessage,
  getUrl,
  isEqualBuffers,
  isStatusSuccessful,
  Maybe,
} from 'uiSrc/utils'
import {
  getBasedOnViewTypeEvent,
  sendEventTelemetry,
  TelemetryEvent,
} from 'uiSrc/telemetry'
import { StateZset } from 'uiSrc/slices/interfaces/zset'
import successMessages from 'uiSrc/components/notifications/success-messages'
import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'
import {
  AddMembersToZSetDto,
  SearchZSetMembersResponse,
  ZSetMemberDto,
  GetZSetResponse,
} from 'apiSrc/modules/browser/z-set/dto'
import {
  deleteKeyFromList,
  deleteSelectedKeySuccess,
  fetchKeyInfo,
  refreshKeyInfoAction,
  updateSelectedKeyRefreshTime,
} from './keys'
import { AppDispatch, RootState } from '../store'
import {
  addErrorNotification,
  addMessageNotification,
} from '../app/notifications'
import { RedisResponseBuffer } from '../interfaces'

export const initialState: StateZset = {
  loading: false,
  searching: false,
  error: '',
  data: {
    total: 0,
    key: undefined,
    keyName: '',
    members: [],
    nextCursor: 0,
    match: '',
    sortOrder: SortOrder.ASC,
  },
  updateScore: {
    loading: false,
    error: '',
  },
}

// A slice for recipes
const zsetSlice = createSlice({
  name: 'zset',
  initialState,
  reducers: {
    setZsetInitialState: () => initialState,

    setZSetMembers: (state, { payload }: PayloadAction<ZSetMemberDto[]>) => {
      state.data.members = payload
    },
    // load ZSet members
    loadZSetMembers: (
      state,
      {
        payload: [sortOrder, resetData = true],
      }: PayloadAction<[SortOrder, Maybe<boolean>]>,
    ) => {
      state.loading = true
      state.searching = false
      state.error = ''

      if (resetData) {
        state.data = initialState.data
      }
      state.data = {
        ...state.data,
        sortOrder,
      }
    },
    loadZSetMembersSuccess: (state, { payload }) => {
      state.data.keyName = payload.keyName
      state.data.members = payload.members
      state.data.total = payload.total
      state.loading = false
    },
    loadZSetMembersFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    searchZSetMembers: (state, { payload }) => {
      state.loading = true
      state.searching = true
      state.error = ''
      state.data = {
        ...initialState.data,
        match: payload,
      }
    },
    searchZSetMembersSuccess: (state, { payload }) => {
      state.data = {
        ...state.data,
        ...payload,
      }
      state.data.key = payload.keyName
      state.loading = false
    },
    searchZSetMembersFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    searchMoreZSetMembers: (state, { payload }) => {
      state.loading = true
      state.searching = true
      state.error = ''
      state.data.match = payload
    },
    searchMoreZSetMembersSuccess: (state, { payload }) => {
      state.loading = false
      state.data.nextCursor = payload.nextCursor
      state.data.members = state.data.members.concat(payload.members)
    },
    searchMoreZSetMembersFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    // load more ZSet members for infinity scroll
    loadMoreZSetMembers: (state) => {
      state.loading = true
      state.searching = false
      state.error = ''
    },
    loadMoreZSetMembersSuccess: (state, { payload: { members } }) => {
      state.loading = false
      state.data.members = state.data.members.concat(members)
    },
    loadMoreZSetMembersFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    removeZsetMembers: (state) => {
      state.loading = true
      state.error = ''
    },
    removeZsetMembersSuccess: (state) => {
      state.loading = false
    },
    removeZsetMembersFailure: (state, { payload }) => {
      state.loading = false
      state.error = payload
    },
    removeMembersFromList: (
      state,
      { payload }: { payload: RedisResponseBuffer[] },
    ) => {
      remove(
        state.data?.members,
        (member) =>
          payload.findIndex((item) => isEqualBuffers(item, member.name)) > -1,
      )

      state.data = {
        ...state.data,
        total: state.data.total - 1,
      }
    },
    updateScore: (state) => {
      state.updateScore = {
        ...state.updateScore,
        loading: true,
        error: '',
      }
    },
    updateScoreSuccess: (state) => {
      state.updateScore = {
        ...state.updateScore,
        loading: false,
      }
    },
    updateScoreFailure: (state, { payload }) => {
      state.updateScore = {
        ...state.updateScore,
        loading: false,
        error: payload,
      }
    },
    resetUpdateScore: (state) => {
      state.updateScore = cloneDeep(initialState.updateScore)
    },
    updateMembersInList: (state, { payload }: { payload: ZSetMemberDto[] }) => {
      const newMembersState = state.data.members.map((listItem) => {
        const index = payload.findIndex((item) =>
          isEqualBuffers(item.name, listItem.name),
        )
        if (index > -1) {
          return payload[index]
        }
        return listItem
      })

      state.data = {
        ...state.data,
        members: newMembersState,
      }
    },
  },
})

// Actions generated from the slice
export const {
  setZsetInitialState,
  loadZSetMembers,
  loadZSetMembersSuccess,
  loadZSetMembersFailure,
  loadMoreZSetMembers,
  loadMoreZSetMembersSuccess,
  loadMoreZSetMembersFailure,
  searchZSetMembers,
  searchZSetMembersSuccess,
  searchZSetMembersFailure,
  searchMoreZSetMembers,
  searchMoreZSetMembersFailure,
  searchMoreZSetMembersSuccess,
  removeZsetMembers,
  removeZsetMembersSuccess,
  removeZsetMembersFailure,
  removeMembersFromList,
  updateScore,
  updateScoreSuccess,
  updateScoreFailure,
  resetUpdateScore,
  updateMembersInList,
  setZSetMembers,
} = zsetSlice.actions

// A selector
export const zsetSelector = (state: RootState) => state.browser.zset
export const zsetDataSelector = (state: RootState) => state.browser.zset?.data
export const updateZsetScoreStateSelector = (state: RootState) =>
  state.browser.zset?.updateScore

// The reducer
export default zsetSlice.reducer

// Asynchronous thunk actions
export function fetchZSetMembers(
  key: RedisResponseBuffer,
  offset: number,
  count: number,
  sortOrder: SortOrder,
  resetData?: boolean,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(loadZSetMembers([sortOrder, resetData]))

    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { data, status } = await apiService.post<GetZSetResponse>(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.ZSET_GET_MEMBERS,
        ),
        {
          keyName: key,
          offset,
          count,
          sortOrder,
        },
        { params: { encoding } },
      )

      if (isStatusSuccessful(status)) {
        dispatch(loadZSetMembersSuccess(data))
        dispatch(updateSelectedKeyRefreshTime(Date.now()))
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(loadZSetMembersFailure(errorMessage))
    }
  }
}

// Asynchronous thunk actions
export function fetchMoreZSetMembers(
  key: RedisResponseBuffer,
  offset: number,
  count: number,
  sortOrder: SortOrder,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(loadMoreZSetMembers())

    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { data, status } = await apiService.post<GetZSetResponse>(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.ZSET_GET_MEMBERS,
        ),
        {
          keyName: key,
          offset,
          count,
          sortOrder,
        },
        { params: { encoding } },
      )

      if (isStatusSuccessful(status)) {
        dispatch(loadMoreZSetMembersSuccess(data))
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(loadMoreZSetMembersFailure(errorMessage))
    }
  }
}

export function fetchAddZSetMembers(
  data: AddMembersToZSetDto,
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(updateScore())
    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { status } = await apiService.put(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.ZSET,
        ),
        data,
        { params: { encoding } },
      )
      if (isStatusSuccessful(status)) {
        sendEventTelemetry({
          event: getBasedOnViewTypeEvent(
            state.browser.keys?.viewType,
            TelemetryEvent.BROWSER_KEY_VALUE_ADDED,
            TelemetryEvent.TREE_VIEW_KEY_VALUE_ADDED,
          ),
          eventData: {
            databaseId: state.connections.instances?.connectedInstance?.id,
            keyType: KeyTypes.ZSet,
            numberOfAdded: data.members.length,
          },
        })
        onSuccessAction?.()
        dispatch(updateScoreSuccess())
        dispatch<any>(fetchKeyInfo(data.keyName))
      }
    } catch (error) {
      onFailAction?.()
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(updateScoreFailure(errorMessage))
    }
  }
}

export function deleteZSetMembers(
  key: RedisResponseBuffer,
  members: RedisResponseBuffer[],
  onSuccessAction?: (newTotal: number) => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(removeZsetMembers())
    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { status, data } = await apiService.delete(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.ZSET_MEMBERS,
        ),
        {
          data: {
            keyName: key,
            members,
            params: { encoding },
          },
        },
      )
      if (isStatusSuccessful(status)) {
        const newTotalValue = state.browser.zset.data.total - data.affected

        onSuccessAction?.(newTotalValue)
        dispatch(removeZsetMembersSuccess())
        dispatch(removeMembersFromList(members))
        if (newTotalValue > 0) {
          dispatch<any>(refreshKeyInfoAction(key))
          dispatch(
            addMessageNotification(
              successMessages.REMOVED_KEY_VALUE(
                key,
                members.map((member) => bufferToString(member)).join(''),
                'Member',
              ),
            ),
          )
        } else {
          dispatch(deleteSelectedKeySuccess())
          dispatch(deleteKeyFromList(key))
          dispatch(addMessageNotification(successMessages.DELETED_KEY(key)))
        }
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(removeZsetMembersFailure(errorMessage))
    }
  }
}

export function updateZSetMembers(
  data: AddMembersToZSetDto,
  onSuccessAction?: () => void,
  onFailAction?: () => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(updateScore())
    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { status } = await apiService.put(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.ZSET,
        ),
        data,
        { params: { encoding } },
      )
      if (isStatusSuccessful(status)) {
        sendEventTelemetry({
          event: getBasedOnViewTypeEvent(
            state.browser.keys?.viewType,
            TelemetryEvent.BROWSER_KEY_VALUE_EDITED,
            TelemetryEvent.TREE_VIEW_KEY_VALUE_EDITED,
          ),
          eventData: {
            databaseId: state.connections.instances?.connectedInstance?.id,
            keyType: KeyTypes.ZSet,
          },
        })
        onSuccessAction?.()
        dispatch(updateScoreSuccess())
        dispatch(updateMembersInList(data.members))
        dispatch<any>(refreshKeyInfoAction(data.keyName))
      }
    } catch (error) {
      onFailAction?.()
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(updateScoreFailure(errorMessage))
    }
  }
}

export function fetchSearchZSetMembers(
  key: RedisResponseBuffer,
  cursor: number,
  count: number,
  match: string,
  onSuccess?: (data: SearchZSetMembersResponse) => void,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(searchZSetMembers(isNull(match) ? '*' : match))
    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { data, status } = await apiService.post<SearchZSetMembersResponse>(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.ZSET_MEMBERS_SEARCH,
        ),
        {
          keyName: key,
          cursor,
          count,
          match,
        },
        { params: { encoding } },
      )

      if (isStatusSuccessful(status)) {
        dispatch(searchZSetMembersSuccess(data))
        dispatch(updateSelectedKeyRefreshTime(Date.now()))
        onSuccess?.(data)
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(searchZSetMembersFailure(errorMessage))
    }
  }
}

export function fetchSearchMoreZSetMembers(
  key: RedisResponseBuffer,
  cursor: number,
  count: number,
  match: string,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    dispatch(searchMoreZSetMembers(match))
    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { data, status } = await apiService.post<SearchZSetMembersResponse>(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.ZSET_MEMBERS_SEARCH,
        ),
        {
          keyName: key,
          cursor,
          count,
          match,
        },
        { params: { encoding } },
      )

      if (isStatusSuccessful(status)) {
        dispatch(searchMoreZSetMembersSuccess(data))
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(searchMoreZSetMembersFailure(errorMessage))
    }
  }
}

export function refreshZsetMembersAction(
  key: RedisResponseBuffer,
  resetData?: boolean,
) {
  return async (dispatch: AppDispatch, stateInit: () => RootState) => {
    const state = stateInit()
    const { searching } = state.browser.zset
    const { match } = state.browser.zset.data
    if (searching) {
      dispatch(searchZSetMembers(isNull(match) ? '*' : match))
      try {
        const state = stateInit()
        const { encoding } = state.app.info
        const { data, status } =
          await apiService.post<SearchZSetMembersResponse>(
            getUrl(
              state.connections.instances.connectedInstance?.id,
              ApiEndpoints.ZSET_MEMBERS_SEARCH,
            ),
            {
              keyName: key,
              cursor: 0,
              count: SCAN_COUNT_DEFAULT,
              match,
            },
            { params: { encoding } },
          )

        if (isStatusSuccessful(status)) {
          dispatch(searchZSetMembersSuccess(data))
        }
      } catch (error) {
        const errorMessage = getApiErrorMessage(error)
        dispatch(addErrorNotification(error))
        dispatch(searchZSetMembersFailure(errorMessage))
      }
      return
    }
    const { sortOrder } = state.browser.zset.data
    dispatch(loadZSetMembers([sortOrder, resetData]))

    try {
      const state = stateInit()
      const { encoding } = state.app.info
      const { data, status } = await apiService.post(
        getUrl(
          state.connections.instances.connectedInstance?.id,
          ApiEndpoints.ZSET_GET_MEMBERS,
        ),
        {
          keyName: key,
          offset: 0,
          count: SCAN_COUNT_DEFAULT,
          sortOrder,
        },
        { params: { encoding } },
      )

      if (isStatusSuccessful(status)) {
        dispatch(loadZSetMembersSuccess(data))
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(error)
      dispatch(addErrorNotification(error))
      dispatch(loadZSetMembersFailure(errorMessage))
    }
  }
}
