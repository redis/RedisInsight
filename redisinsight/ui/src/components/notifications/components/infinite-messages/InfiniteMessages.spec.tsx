import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import { OAuthProvider } from 'uiSrc/components/oauth/oauth-select-plan/constants'
import notificationsReducer, {
  addInfiniteNotification,
} from 'uiSrc/slices/app/notifications'
import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { InfiniteMessage } from 'uiSrc/slices/interfaces'
import Notifications from '../../Notifications'
import { INFINITE_MESSAGES } from './InfiniteMessages'

const createTestStore = () =>
  configureStore({
    reducer: combineReducers({
      app: combineReducers({ notifications: notificationsReducer }),
    }),
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }),
  })

const renderToast = (notification: InfiniteMessage) => {
  const store = createTestStore()

  render(
    <>
      {/* <RiToaster /> */}
      <Notifications />
    </>,
    { store },
  )

  store.dispatch(addInfiniteNotification(notification))
}

describe('INFINITE_MESSAGES', () => {
  describe('SUCCESS_CREATE_DB', () => {
    it('should render message', () => {
      const { Inner } = INFINITE_MESSAGES.SUCCESS_CREATE_DB({}, jest.fn())
      expect(render(<>{Inner}</>)).toBeTruthy()
    })

    it('should call onSuccess', () => {
      const onSuccess = jest.fn()
      const { Inner } = INFINITE_MESSAGES.SUCCESS_CREATE_DB({}, onSuccess)
      render(<>{Inner}</>)

      fireEvent.click(screen.getByTestId('notification-connect-db'))
      fireEvent.mouseUp(screen.getByTestId('success-create-db-notification'))
      fireEvent.mouseDown(screen.getByTestId('success-create-db-notification'))

      expect(onSuccess).toBeCalled()
    })

    it('should render plan details', () => {
      const { Inner } = INFINITE_MESSAGES.SUCCESS_CREATE_DB(
        { region: 'us-us', provider: OAuthProvider.AWS },
        jest.fn(),
      )
      render(<>{Inner}</>)

      expect(screen.getByTestId('notification-details-plan')).toHaveTextContent(
        'Free',
      )
      expect(
        screen.getByTestId('notification-details-vendor'),
      ).toHaveTextContent('Amazon Web Services')
      expect(
        screen.getByTestId('notification-details-region'),
      ).toHaveTextContent('us-us')
    })
  })

  describe('AUTHENTICATING', () => {
    it('should render message', async () => {
      renderToast(INFINITE_MESSAGES.AUTHENTICATING())

      // Wait for the notification to appear
      const title = await screen.findByText('Authenticating…')
      const description = await screen.findByText(
        'This may take several seconds, but it is totally worth it!',
      )
      const closeButton = await screen.findByRole('button', { name: /close/i })

      expect(title).toBeInTheDocument()
      expect(description).toBeInTheDocument()
      expect(closeButton).toBeInTheDocument()
    })
  })

  describe('PENDING_CREATE_DB', () => {
    it('should render message', async () => {
      renderToast(INFINITE_MESSAGES.PENDING_CREATE_DB())

      // Wait for the notification to appear
      const title = await screen.findByText('Processing Cloud API keys…')
      const description = await screen.findByText(
        /This may take several minutes, but it is totally worth it!\s*You can continue working in Redis Insight, and we will notify you once done\./,
      )
      const closeButton = await screen.findByRole('button', { name: /close/i })

      expect(title).toBeInTheDocument()
      expect(description).toBeInTheDocument()
      expect(closeButton).toBeInTheDocument()
    })
  })

  describe('DATABASE_EXISTS', () => {
    it('should render message', () => {
      const { Inner } = INFINITE_MESSAGES.DATABASE_EXISTS(jest.fn())
      expect(render(<>{Inner}</>)).toBeTruthy()
    })

    it('should call onSuccess', () => {
      const onSuccess = jest.fn()
      const { Inner } = INFINITE_MESSAGES.DATABASE_EXISTS(onSuccess)
      render(<>{Inner}</>)

      fireEvent.click(screen.getByTestId('import-db-sso-btn'))
      fireEvent.mouseUp(screen.getByTestId('database-exists-notification'))
      fireEvent.mouseDown(screen.getByTestId('database-exists-notification'))

      expect(onSuccess).toBeCalled()
    })

    it('should call onCancel', () => {
      const onSuccess = jest.fn()
      const onCancel = jest.fn()
      const { Inner } = INFINITE_MESSAGES.DATABASE_EXISTS(onSuccess, onCancel)
      render(<>{Inner}</>)

      fireEvent.click(screen.getByTestId('cancel-import-db-sso-btn'))
      fireEvent.mouseUp(screen.getByTestId('database-exists-notification'))
      fireEvent.mouseDown(screen.getByTestId('database-exists-notification'))

      expect(onCancel).toBeCalled()
    })
  })

  describe('DATABASE_IMPORT_FORBIDDEN', () => {
    it('should render message', () => {
      const { Inner } = INFINITE_MESSAGES.DATABASE_IMPORT_FORBIDDEN(jest.fn())
      expect(render(<>{Inner}</>)).toBeTruthy()
    })

    it('should call onClose', () => {
      const onClose = jest.fn()
      const { Inner } = INFINITE_MESSAGES.DATABASE_IMPORT_FORBIDDEN(onClose)
      render(<>{Inner}</>)

      fireEvent.click(
        screen.getByTestId('database-import-forbidden-notification-ok-btn'),
      )
      fireEvent.mouseUp(
        screen.getByTestId('database-import-forbidden-notification'),
      )
      fireEvent.mouseDown(
        screen.getByTestId('database-import-forbidden-notification'),
      )

      expect(onClose).toBeCalled()
    })
  })

  describe('SUBSCRIPTION_EXISTS', () => {
    it('should render message', () => {
      const { Inner } = INFINITE_MESSAGES.SUBSCRIPTION_EXISTS(jest.fn())
      expect(render(<>{Inner}</>)).toBeTruthy()
    })

    it('should call onSuccess', () => {
      const onSuccess = jest.fn()
      const { Inner } = INFINITE_MESSAGES.SUBSCRIPTION_EXISTS(onSuccess)
      render(<>{Inner}</>)

      fireEvent.click(screen.getByTestId('create-subscription-sso-btn'))
      fireEvent.mouseUp(screen.getByTestId('subscription-exists-notification'))
      fireEvent.mouseDown(
        screen.getByTestId('subscription-exists-notification'),
      )

      expect(onSuccess).toBeCalled()
    })

    it('should call onCancel', () => {
      const onSuccess = jest.fn()
      const onCancel = jest.fn()
      const { Inner } = INFINITE_MESSAGES.SUBSCRIPTION_EXISTS(
        onSuccess,
        onCancel,
      )
      render(<>{Inner}</>)

      fireEvent.click(screen.getByTestId('cancel-create-subscription-sso-btn'))
      fireEvent.mouseUp(screen.getByTestId('subscription-exists-notification'))
      fireEvent.mouseDown(
        screen.getByTestId('subscription-exists-notification'),
      )

      expect(onCancel).toBeCalled()
    })
  })

  describe('AUTO_CREATING_DATABASE', () => {
    it('should render message', () => {
      const { Inner } = INFINITE_MESSAGES.AUTO_CREATING_DATABASE()
      expect(render(<>{Inner}</>)).toBeTruthy()
    })
  })

  describe('APP_UPDATE_AVAILABLE', () => {
    it('should render message', async () => {
      const version = '<version>'
      const onSuccess = jest.fn()

      renderToast(INFINITE_MESSAGES.APP_UPDATE_AVAILABLE(version, onSuccess))

      // Wait for the notification to appear
      const title = await screen.findByText('New version is now available')
      const description = await screen.findByText(
        /With Redis Insight <version> you have access to new useful features and optimizations\.\s*Restart Redis Insight to install updates\./,
      )
      const restartButton = await screen.findByRole('button', {
        name: /Restart/,
      })
      const closeButton = await screen.findByRole('button', { name: /close/i })

      expect(title).toBeInTheDocument()
      expect(description).toBeInTheDocument()
      expect(restartButton).toBeInTheDocument()
      expect(closeButton).toBeInTheDocument()
    })

    it('should call onSuccess when clicking restart button', async () => {
      const version = '<version>'
      const onSuccess = jest.fn()

      renderToast(INFINITE_MESSAGES.APP_UPDATE_AVAILABLE(version, onSuccess))

      const restartButton = await screen.findByRole('button', {
        name: /Restart/,
      })
      expect(restartButton).toBeInTheDocument()

      fireEvent.click(restartButton)

      expect(onSuccess).toHaveBeenCalled()
    })
  })

  describe('SUCCESS_DEPLOY_PIPELINE', () => {
    it('should render message', async () => {
      renderToast(INFINITE_MESSAGES.SUCCESS_DEPLOY_PIPELINE())

      // Wait for the notification to appear
      const title = await screen.findByText('Congratulations!')
      const description = await screen.findByText(
        /Deployment completed successfully!\s*Check out the pipeline statistics page\./,
      )
      const closeButton = await screen.findByRole('button', { name: /close/i })

      expect(title).toBeInTheDocument()
      expect(description).toBeInTheDocument()
      expect(closeButton).toBeInTheDocument()
    })
  })
})
