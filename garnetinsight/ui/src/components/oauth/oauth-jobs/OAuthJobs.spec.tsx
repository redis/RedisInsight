import React from 'react'
import { cloneDeep } from 'lodash'
import { useSelector } from 'react-redux'
import { AxiosError } from 'axios'
import {
  cleanup,
  clearStoreActions,
  mockedStore,
  render,
} from 'uiSrc/utils/test-utils'
import {
  logoutUser,
  oauthCloudJobSelector,
  setJob,
  setSocialDialogState,
} from 'uiSrc/slices/oauth/cloud'
import {
  CloudJobStatus,
  CloudJobName,
  CloudJobStep,
} from 'uiSrc/electron/constants'
import {
  addErrorNotification,
  addInfiniteNotification,
  removeInfiniteNotification,
} from 'uiSrc/slices/app/notifications'
import { RootState } from 'uiSrc/slices/store'
import { loadInstances } from 'uiSrc/slices/instances/instances'
import {
  INFINITE_MESSAGES,
  InfiniteMessagesIds,
} from 'uiSrc/components/notifications/components'
import { CustomErrorCodes } from 'uiSrc/constants'
import { setSSOFlow } from 'uiSrc/slices/instances/cloud'
import OAuthJobs from './OAuthJobs'

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}))

jest.mock('uiSrc/slices/oauth/cloud', () => ({
  ...jest.requireActual('uiSrc/slices/oauth/cloud'),
  oauthCloudJobSelector: jest.fn().mockReturnValue({
    status: '',
    step: 'subscription',
  }),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('OAuthJobs', () => {
  beforeEach(() => {
    const state = store.getState() as RootState

    ;(useSelector as jest.Mock).mockImplementation(
      (callback: (arg0: any) => any) =>
        callback({
          ...state,
        }),
    )
  })

  it('should render', () => {
    expect(render(<OAuthJobs />)).toBeTruthy()
  })

  it('should call addInfiniteNotification when status changed to "running"', async () => {
    const { rerender } = render(<OAuthJobs />)

    ;(oauthCloudJobSelector as jest.Mock).mockImplementation(() => ({
      status: CloudJobStatus.Running,
    }))

    rerender(<OAuthJobs />)

    const expectedActions = [
      addInfiniteNotification(INFINITE_MESSAGES.PENDING_CREATE_DB),
    ]
    expect(clearStoreActions(store.getActions())).toEqual(
      clearStoreActions(expectedActions),
    )
  })

  it('should not call addInfiniteNotification the second time when status "running"', async () => {
    ;(oauthCloudJobSelector as jest.Mock).mockImplementation(() => ({
      status: '',
    }))

    const { rerender } = render(<OAuthJobs />)

    ;(oauthCloudJobSelector as jest.Mock).mockImplementation(() => ({
      status: CloudJobStatus.Running,
    }))

    rerender(<OAuthJobs />)
    ;(oauthCloudJobSelector as jest.Mock).mockImplementation(() => ({
      status: CloudJobStatus.Running,
      id: '123',
    }))

    rerender(<OAuthJobs />)

    const expectedActions = [
      addInfiniteNotification(INFINITE_MESSAGES.PENDING_CREATE_DB),
    ]
    expect(clearStoreActions(store.getActions())).toEqual(
      clearStoreActions(expectedActions),
    )
  })

  it('should call loadInstances and setJob when status changed to "finished" without error', async () => {
    const resourceId = '123123'

    const { rerender } = render(<OAuthJobs />)

    ;(oauthCloudJobSelector as jest.Mock).mockImplementation(() => ({
      status: CloudJobStatus.Finished,
      step: CloudJobStep.Database,
      result: { resourceId },
    }))

    rerender(<OAuthJobs />)

    const expectedActions = [
      addInfiniteNotification(
        INFINITE_MESSAGES.PENDING_CREATE_DB(CloudJobStep.Database),
      ),
      loadInstances(),
      setJob({ id: '', name: CloudJobName.CreateFreeDatabase, status: '' }),
    ]
    expect(clearStoreActions(store.getActions())).toEqual(
      clearStoreActions(expectedActions),
    )
  })

  it('should call loadInstances and setJob when status changed to "finished" with error', async () => {
    const error = 'error'
    ;(oauthCloudJobSelector as jest.Mock).mockImplementation(() => ({
      status: '',
    }))

    const { rerender } = render(<OAuthJobs />)

    ;(oauthCloudJobSelector as jest.Mock).mockImplementation(() => ({
      status: CloudJobStatus.Failed,
      error,
    }))

    rerender(<OAuthJobs />)

    const expectedActions = [
      addErrorNotification({ response: { data: error } } as AxiosError),
      setSSOFlow(),
      setSocialDialogState(null),
      removeInfiniteNotification(InfiniteMessagesIds.oAuthProgress),
    ]
    expect(clearStoreActions(store.getActions())).toEqual(
      clearStoreActions(expectedActions),
    )
  })

  it('should call addInfiniteNotification and removeInfiniteNotification when errorCode is 11_108', async () => {
    const mockDatabaseId = '123'
    const error = {
      errorCode: CustomErrorCodes.CloudDatabaseAlreadyExistsFree,
      resource: {
        databaseId: mockDatabaseId,
      },
    }
    ;(oauthCloudJobSelector as jest.Mock).mockImplementation(() => ({
      status: '',
    }))

    const { rerender } = render(<OAuthJobs />)

    ;(oauthCloudJobSelector as jest.Mock).mockImplementation(() => ({
      status: CloudJobStatus.Failed,
      error,
    }))

    rerender(<OAuthJobs />)

    const expectedActions = [
      addInfiniteNotification(INFINITE_MESSAGES.DATABASE_EXISTS()),
      setSSOFlow(),
      setSocialDialogState(null),
      removeInfiniteNotification(InfiniteMessagesIds.oAuthProgress),
    ]
    expect(clearStoreActions(store.getActions())).toEqual(
      clearStoreActions(expectedActions),
    )
  })

  it('should call addInfiniteNotification and removeInfiniteNotification when errorCode is 11_114', async () => {
    const mockDatabaseId = '123'
    const error = {
      errorCode: CustomErrorCodes.CloudSubscriptionAlreadyExistsFree,
      resource: {
        databaseId: mockDatabaseId,
      },
    }
    ;(oauthCloudJobSelector as jest.Mock).mockImplementation(() => ({
      status: '',
    }))

    const { rerender } = render(<OAuthJobs />)

    ;(oauthCloudJobSelector as jest.Mock).mockImplementation(() => ({
      status: CloudJobStatus.Failed,
      error,
    }))

    rerender(<OAuthJobs />)

    const expectedActions = [
      addInfiniteNotification(INFINITE_MESSAGES.DATABASE_EXISTS()),
      setSSOFlow(),
      setSocialDialogState(null),
      removeInfiniteNotification(InfiniteMessagesIds.oAuthProgress),
    ]
    expect(clearStoreActions(store.getActions())).toEqual(
      clearStoreActions(expectedActions),
    )
  })

  it('should call addInfiniteNotification and removeInfiniteNotification when errorCode is 11_115', async () => {
    const error = {
      errorCode: CustomErrorCodes.CloudDatabaseImportForbidden,
    }
    ;(oauthCloudJobSelector as jest.Mock).mockImplementation(() => ({
      status: '',
    }))

    const { rerender } = render(<OAuthJobs />)

    ;(oauthCloudJobSelector as jest.Mock).mockImplementation(() => ({
      status: CloudJobStatus.Failed,
      error,
    }))

    rerender(<OAuthJobs />)

    const expectedActions = [
      addInfiniteNotification(INFINITE_MESSAGES.DATABASE_IMPORT_FORBIDDEN()),
      setSSOFlow(),
      setSocialDialogState(null),
      removeInfiniteNotification(InfiniteMessagesIds.oAuthProgress),
    ]
    expect(clearStoreActions(store.getActions())).toEqual(
      clearStoreActions(expectedActions),
    )
  })

  it('should call logoutUser when statusCode is 401', async () => {
    const mockDatabaseId = '123'
    const error = {
      statusCode: 401,
      errorCode: CustomErrorCodes.CloudSubscriptionAlreadyExistsFree,
      resource: {
        databaseId: mockDatabaseId,
      },
    }
    ;(oauthCloudJobSelector as jest.Mock).mockImplementation(() => ({
      status: '',
    }))

    const { rerender } = render(<OAuthJobs />)

    ;(oauthCloudJobSelector as jest.Mock).mockImplementation(() => ({
      status: CloudJobStatus.Failed,
      error,
    }))

    rerender(<OAuthJobs />)

    const expectedActions = [
      logoutUser(),
      setSSOFlow(),
      addInfiniteNotification(INFINITE_MESSAGES.DATABASE_EXISTS()),
      setSSOFlow(),
      setSocialDialogState(null),
      removeInfiniteNotification(InfiniteMessagesIds.oAuthProgress),
    ]
    expect(clearStoreActions(store.getActions())).toEqual(
      clearStoreActions(expectedActions),
    )
  })
})
