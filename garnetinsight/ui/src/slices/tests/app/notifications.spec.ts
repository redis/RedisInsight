import { cloneDeep } from 'lodash'
import { apiService } from 'uiSrc/services'

import {
  cleanup,
  initialStateDefault,
  mockedStore,
} from 'uiSrc/utils/test-utils'

import { IError, IMessage } from 'uiSrc/slices/interfaces'
import reducer, {
  initialState,
  removeError,
  removeMessage,
  resetErrors,
  resetMessages,
  addMessageNotification,
  addErrorNotification,
  errorsSelector,
  messagesSelector,
  IAddInstanceErrorPayload,
  setIsCenterOpen,
  notificationCenterSelector,
  setIsNotificationOpen,
  setNewNotificationReceived,
  setLastReceivedNotification,
  getNotifications,
  getNotificationsSuccess,
  fetchNotificationsAction,
  getNotificationsFailed,
  unreadNotificationsAction,
  unreadNotifications,
  setNewNotificationAction,
  addInfiniteNotification,
  removeInfiniteNotification,
} from '../../app/notifications'

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

const notificationsResponse: any = {
  notifications: [
    {
      timestamp: 123123125,
      title: 'string',
      body: 'string',
      read: false,
    },
    {
      timestamp: 123123123,
      title: 'string',
      body: 'string',
      read: false,
    },
    {
      timestamp: 123123121,
      title: 'string',
      body: 'string',
      read: false,
    },
  ],
  totalUnread: 3,
}

describe('slices', () => {
  describe('reducer, actions and selectors', () => {
    it('should return the initial state on first run', () => {
      // Arrange
      const nextState = initialState

      // Act
      const result = reducer(undefined, {})

      // Assert
      expect(result).toEqual(nextState)
    })
  })

  describe('addErrorNotification', () => {
    it('should properly set the state', () => {
      // Arrange
      const errorMessage = 'some error'
      const responsePayload = {
        instanceId: undefined,
        name: 'Error',
        response: {
          status: 500,
          data: { message: errorMessage },
        },
      }

      // Act
      const nextState = reducer(
        initialState,
        addErrorNotification(responsePayload as IAddInstanceErrorPayload),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { notifications: nextState },
      })

      const state = {
        ...initialState,
        errors: [
          {
            ...responsePayload,
            id: errorsSelector(rootState)[0].id,
            message: responsePayload.response.data.message,
          },
        ],
      }

      expect(errorsSelector(rootState)).toEqual(state.errors)
    })
  })

  describe('removeError', () => {
    it('should properly remove the error', () => {
      // Arrange
      const stateWithErrors: IError[] = [
        // @ts-ignore
        { id: '1', message: '' },
        // @ts-ignore
        { id: '2', message: '' },
      ]

      // Act
      const nextState = reducer(
        {
          ...initialState,
          errors: stateWithErrors,
        },
        removeError('1'),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { notifications: nextState },
      })

      const state = {
        ...initialState,
        errors: [{ id: '2', message: '' }],
      }

      expect(errorsSelector(rootState)).toEqual(state.errors)
    })
  })

  describe('resetErrors', () => {
    it('should properly reset errors', () => {
      // Arrange
      const stateWithErrors: IError[] = [
        // @ts-ignore
        { id: '1', message: '' },
        // @ts-ignore
        { id: '2', message: '' },
      ]

      // Act
      const nextState = reducer(
        {
          ...initialState,
          errors: stateWithErrors,
        },
        resetErrors(),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { notifications: nextState },
      })

      const state = {
        ...initialState,
        errors: [],
      }

      expect(errorsSelector(rootState)).toEqual(state.errors)
    })
  })

  describe('addMessageNotification', () => {
    it('should properly set the state', () => {
      // Arrange
      const message = 'some message'
      const responsePayload = {
        response: {
          status: 200,
          data: { message },
        },
      }

      // Act
      const nextState = reducer(
        initialState,
        addMessageNotification(responsePayload),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { notifications: nextState },
      })

      const state = {
        ...initialState,
        messages: [
          {
            ...responsePayload,
            id: messagesSelector(rootState)[0].id,
          },
        ],
      }

      expect(messagesSelector(rootState)).toEqual(state.messages)
    })
  })

  describe('removeMessage', () => {
    it('should properly remove the message', () => {
      // Arrange
      const stateWithMessages: IMessage[] = [
        { id: '1', message: '', title: '' },
        { id: '2', message: '', title: '' },
      ]

      // Act
      const nextState = reducer(
        {
          ...initialState,
          messages: stateWithMessages,
        },
        removeMessage('1'),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { notifications: nextState },
      })

      const state = {
        ...initialState,
        messages: [{ id: '2', message: '', title: '' }],
      }

      expect(messagesSelector(rootState)).toEqual(state.messages)
    })
  })

  describe('resetMessages', () => {
    it('should properly reset errors', () => {
      // Arrange
      const stateWithMessages: IMessage[] = [
        { id: '1', message: '', title: '' },
        { id: '2', message: '', title: '' },
      ]

      // Act
      const nextState = reducer(
        {
          ...initialState,
          messages: stateWithMessages,
        },
        resetMessages(),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { notifications: nextState },
      })

      const state = {
        ...initialState,
        messages: [],
      }

      expect(messagesSelector(rootState)).toEqual(state.messages)
    })
  })

  describe('setIsCenterOpen', () => {
    it('should properly toggle isCenterOpen', () => {
      const state = {
        ...initialState,
        notificationCenter: {
          ...initialState.notificationCenter,
          isCenterOpen: true,
        },
      }
      // Act
      const nextState = reducer(initialState, setIsCenterOpen())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { notifications: nextState },
      })

      expect(notificationCenterSelector(rootState)).toEqual(
        state.notificationCenter,
      )
    })
  })

  describe('setIsNotificationOpen', () => {
    it('should properly toggle isNotificationOpen', () => {
      const state = {
        ...initialState,
        notificationCenter: {
          ...initialState.notificationCenter,
          isNotificationOpen: true,
        },
      }
      // Act
      const nextState = reducer(initialState, setIsNotificationOpen())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { notifications: nextState },
      })

      expect(notificationCenterSelector(rootState)).toEqual(
        state.notificationCenter,
      )
    })
  })

  describe('setNewNotificationReceived', () => {
    it('should properly set new notification', () => {
      const state = {
        ...initialState,
        notificationCenter: {
          ...initialState.notificationCenter,
          totalUnread: notificationsResponse.totalUnread,
          isNotificationOpen: true,
        },
      }
      // Act
      const nextState = reducer(
        initialState,
        setNewNotificationReceived(notificationsResponse),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { notifications: nextState },
      })

      expect(notificationCenterSelector(rootState)).toEqual(
        state.notificationCenter,
      )
    })
  })

  describe('setLastReceivedNotification', () => {
    it('should properly set lastReceivedNotification', () => {
      const state = {
        ...initialState,
        notificationCenter: {
          ...initialState.notificationCenter,
          lastReceivedNotification: notificationsResponse.notifications[0],
        },
      }
      // Act
      const nextState = reducer(
        initialState,
        setLastReceivedNotification(notificationsResponse.notifications[0]),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { notifications: nextState },
      })

      expect(notificationCenterSelector(rootState)).toEqual(
        state.notificationCenter,
      )
    })
  })

  describe('getNotifications', () => {
    it('should properly set state', () => {
      const state = {
        ...initialState,
        notificationCenter: {
          ...initialState.notificationCenter,
          loading: true,
        },
      }
      // Act
      const nextState = reducer(initialState, getNotifications())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { notifications: nextState },
      })

      expect(notificationCenterSelector(rootState)).toEqual(
        state.notificationCenter,
      )
    })
  })

  describe('getNotificationsSuccess', () => {
    it('should properly set state', () => {
      const state = {
        ...initialState,
        notificationCenter: {
          ...initialState.notificationCenter,
          loading: false,
          notifications: notificationsResponse.notifications,
          totalUnread: notificationsResponse.totalUnread,
        },
      }
      // Act
      const nextState = reducer(
        initialState,
        getNotificationsSuccess(notificationsResponse),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { notifications: nextState },
      })

      expect(notificationCenterSelector(rootState)).toEqual(
        state.notificationCenter,
      )
    })
  })

  describe('addInfiniteNotification', () => {
    it('should properly set state with new notification', () => {
      const notification = {
        id: 'id',
        Inner: 'message text',
      }
      const state = {
        ...initialState,
        infiniteMessages: [notification],
      }
      // Act
      const nextState = reducer(
        initialState,
        addInfiniteNotification(notification),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { notifications: nextState },
      })

      expect(notificationCenterSelector(rootState)).toEqual(
        state.notificationCenter,
      )
    })

    it('should properly set state with updated notification', () => {
      const notification = {
        id: 'id',
        Inner: 'updated text',
      }

      const currentState = {
        ...initialState,
        infiniteMessages: [
          {
            id: 'id',
            Inner: 'message text',
          },
        ],
      }

      const state = {
        ...initialState,
        infiniteMessages: [notification],
      }

      // Act
      const nextState = reducer(
        currentState,
        addInfiniteNotification(notification),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { notifications: nextState },
      })

      expect(notificationCenterSelector(rootState)).toEqual(
        state.notificationCenter,
      )
    })
  })

  describe('removeInfiniteNotification', () => {
    it('should properly remove notification', () => {
      const notification = {
        id: 'id',
        Inner: 'message text',
      }

      const currentState = {
        ...initialState,
        infiniteMessages: [notification],
      }

      const state = {
        ...initialState,
      }
      // Act
      const nextState = reducer(
        currentState,
        removeInfiniteNotification(notification.id),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { notifications: nextState },
      })

      expect(notificationCenterSelector(rootState)).toEqual(
        state.notificationCenter,
      )
    })
  })

  // thunks

  describe('thunks', () => {
    describe('fetchNotificationsAction', () => {
      it('succeed to fetch data', async () => {
        // Arrange
        const data = notificationsResponse
        const responsePayload = { data, status: 200 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchNotificationsAction())

        // Assert
        const expectedActions = [
          getNotifications(),
          getNotificationsSuccess(data),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to fetch data', async () => {
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.get = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchNotificationsAction())

        // Assert
        const expectedActions = [getNotifications(), getNotificationsFailed()]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('unreadNotificationsAction', () => {
      it('succeed to fetch data', async () => {
        // Arrange
        const data = notificationsResponse
        const responsePayload = { data, status: 200 }

        apiService.patch = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(unreadNotificationsAction(data.totalUnread))

        // Assert
        const expectedActions = [unreadNotifications(data.totalUnread)]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('setNewNotificationAction', () => {
      it('succeed to update notificationsCenter', () => {
        const data = notificationsResponse
        store.dispatch<any>(setNewNotificationAction(data))

        const expectedActions = [
          setNewNotificationReceived(data),
          setLastReceivedNotification(null),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })
  })
})
