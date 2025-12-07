import { cloneDeep } from 'lodash'
import reducer, {
  initialState,
  fetchDBSettings,
  getDBSettingsSuccess,
  getDBSettingsFailure,
  getDBSettings,
  appDBSettingsSelector,
} from 'uiSrc/slices/app/db-settings'
import {
  cleanup,
  initialStateDefault,
  mockedStore,
} from 'uiSrc/utils/test-utils'
import { apiService } from 'uiSrc/services'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('DB Settings slices', () => {
  beforeEach(() => {})
  afterAll(() => {})

  it('get db settings reducer should properly set the loading state', () => {
    const nextState = reducer(initialState, getDBSettings())

    const newState = {
      ...initialStateDefault,
      app: {
        ...initialStateDefault.app,
        dbSettings: nextState,
      },
    }

    expect(appDBSettingsSelector(newState).loading).toEqual(true)
  })

  it('get db settings success reducer should properly set the state', () => {
    const nextState = reducer(
      initialState,
      getDBSettingsSuccess({ data: { key: 'test' }, id: 'testDb' }),
    )

    const newState = {
      ...initialStateDefault,
      app: {
        ...initialStateDefault.app,
        dbSettings: nextState,
      },
    }

    expect(appDBSettingsSelector(newState).data).toEqual({
      testDb: {
        key: 'test',
      },
    })
    expect(appDBSettingsSelector(newState).loading).toEqual(false)
  })

  it('get db settings failure reducer should properly set the state', () => {
    const nextState = reducer(
      initialState,
      getDBSettingsFailure({ error: 'something went wrong' }),
    )

    const newState = {
      ...initialStateDefault,
      app: {
        ...initialStateDefault.app,
        dbSettings: nextState,
      },
    }

    expect(appDBSettingsSelector(newState).data).toEqual({})
    expect(appDBSettingsSelector(newState).loading).toEqual(false)
    expect(appDBSettingsSelector(newState).error).toEqual({
      error: 'something went wrong',
    })
  })

  it('fetchDBSettings should fetch database settings', async () => {
    apiService.get = jest.fn().mockResolvedValueOnce({
      status: 200,
      data: {
        data: {
          key: 'test',
        },
      },
    })
    const successFn = jest.fn()
    const failFn = jest.fn()
    await store.dispatch<any>(fetchDBSettings('testDb', successFn, failFn))

    expect(store.getActions()).toEqual([
      getDBSettings(),
      getDBSettingsSuccess({
        data: { key: 'test' },
        id: 'testDb',
      }),
    ])
    expect(successFn).toHaveBeenCalledWith({
      data: { key: 'test' },
      id: 'testDb',
    })
    expect(failFn).not.toHaveBeenCalled()
  })

  it('fetchDbSettings should handle generic failure', async () => {
    apiService.get = jest.fn().mockRejectedValueOnce(new Error())
    const successFn = jest.fn()
    const failFn = jest.fn()
    await store.dispatch<any>(fetchDBSettings('testDb', successFn, failFn))

    expect(store.getActions()).toEqual([
      getDBSettings(),
      getDBSettingsFailure('Something was wrong!'),
    ])
    expect(successFn).not.toHaveBeenCalled()
    expect(failFn).toHaveBeenCalled()
  })

  it('fetchDbSettings should handle axios failure', async () => {
    apiService.get = jest.fn().mockRejectedValueOnce({
      response: { data: { message: 'something went wrong' } },
    })
    const successFn = jest.fn()
    const failFn = jest.fn()
    await store.dispatch<any>(fetchDBSettings('testDb', successFn, failFn))

    expect(store.getActions()).toEqual([
      getDBSettings(),
      getDBSettingsFailure('something went wrong'),
    ])
    expect(successFn).not.toHaveBeenCalled()
    expect(failFn).toHaveBeenCalled()
  })

  it('fetchDbSettings should handle missing db id failure', async () => {
    const successFn = jest.fn()
    const failFn = jest.fn()
    await store.dispatch<any>(fetchDBSettings('', successFn, failFn))

    expect(store.getActions()).toEqual([
      getDBSettings(),
      getDBSettingsFailure('DB not connected'),
    ])
    expect(successFn).not.toHaveBeenCalled()
    expect(failFn).toHaveBeenCalled()
  })
})
