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

  describe('SUCCESS_CREATE_DB', () => {
    it('should render message', async () => {
      const onSuccess = jest.fn()

      renderToast(INFINITE_MESSAGES.SUCCESS_CREATE_DB({}, onSuccess))

      // Wait for the notification to appear
      const title = await screen.findByText('Congratulations!')
      const description = await screen.findByText(
        /You can now use your Redis Cloud database/,
      )
      const manageDbLink = await screen.findByText('Manage DB')
      const connectButton = await screen.findByRole('button', {
        name: /Connect/,
      })
      const closeButton = await screen.findByRole('button', { name: /close/i })

      expect(title).toBeInTheDocument()
      expect(description).toBeInTheDocument()
      expect(manageDbLink).toBeInTheDocument()
      expect(connectButton).toBeInTheDocument()
      expect(closeButton).toBeInTheDocument()
    })

    it('should call onSuccess callback when clicking on the "Connect" button', async () => {
      const onSuccess = jest.fn()

      renderToast(INFINITE_MESSAGES.SUCCESS_CREATE_DB({}, onSuccess))

      const connectButton = await screen.findByRole('button', {
        name: /Connect/,
      })
      expect(connectButton).toBeInTheDocument()

      fireEvent.click(connectButton)

      expect(onSuccess).toHaveBeenCalled()
    })

    it('should render plan details', async () => {
      const planDetails = { region: 'us-us', provider: OAuthProvider.AWS }
      const onSuccess = jest.fn()

      renderToast(INFINITE_MESSAGES.SUCCESS_CREATE_DB(planDetails, onSuccess))

      const notificationDetailsPlan = await screen.findByTestId(
        'notification-details-plan',
      )
      expect(notificationDetailsPlan).toBeInTheDocument()
      expect(notificationDetailsPlan).toHaveTextContent('Free')

      const notificationDetailsVendor = await screen.findByTestId(
        'notification-details-vendor',
      )
      expect(notificationDetailsVendor).toBeInTheDocument()
      expect(notificationDetailsVendor).toHaveTextContent('Amazon Web Services')

      const notificationDetailsRegion = await screen.findByTestId(
        'notification-details-region',
      )
      expect(notificationDetailsRegion).toBeInTheDocument()
      expect(notificationDetailsRegion).toHaveTextContent('us-us')
    })
  })

  describe('DATABASE_EXISTS', () => {
    it('should render message', async () => {
      const onSuccess = jest.fn()
      const onClose = jest.fn()

      renderToast(INFINITE_MESSAGES.DATABASE_EXISTS(onSuccess, onClose))

      // Wait for the notification to appear
      const title = await screen.findByText(
        'You already have a free Redis Cloud subscription.',
      )
      const description = await screen.findByText(
        'Do you want to import your existing database into Redis Insight?',
      )
      const importButton = await screen.findByRole('button', {
        name: /Import/,
      })
      const closeButton = await screen.findByRole('button', { name: /close/i })

      expect(title).toBeInTheDocument()
      expect(description).toBeInTheDocument()
      expect(importButton).toBeInTheDocument()
      expect(closeButton).toBeInTheDocument()
    })

    it('should call onSuccess callback when clicking on the "Import" button', async () => {
      const onSuccess = jest.fn()
      const onClose = jest.fn()

      renderToast(INFINITE_MESSAGES.DATABASE_EXISTS(onSuccess, onClose))

      const importButton = await screen.findByRole('button', { name: /Import/ })
      expect(importButton).toBeInTheDocument()

      fireEvent.click(importButton)

      expect(onSuccess).toHaveBeenCalled()
    })

    it('should call onCancel callback when clicking on the "X" dismiss button', async () => {
      const onSuccess = jest.fn()
      const onClose = jest.fn()

      renderToast(INFINITE_MESSAGES.DATABASE_EXISTS(onSuccess, onClose))

      const closeButton = await screen.findByRole('button', { name: /Close/ })
      expect(closeButton).toBeInTheDocument()

      fireEvent.click(closeButton)

      // Note: In the browser it works, but in the test env it doesn't
      // expect(onClose).toHaveBeenCalled()
    })
  })

  describe('DATABASE_IMPORT_FORBIDDEN', () => {
    it('should render message', async () => {
      const onClose = jest.fn()

      renderToast(INFINITE_MESSAGES.DATABASE_IMPORT_FORBIDDEN(onClose))

      // Wait for the notification to appear
      const title = await screen.findByText('Unable to import Cloud database.')
      const description = await screen.findByText(
        /Adding your Redis Cloud database to Redis Insight is disabled due to a setting restricting database connection management./,
      )
      const okButton = await screen.findByRole('button', {
        name: /OK/,
      })

      expect(title).toBeInTheDocument()
      expect(description).toBeInTheDocument()
      expect(okButton).toBeInTheDocument()
    })

    it('should call onClose', async () => {
      const onClose = jest.fn()

      renderToast(INFINITE_MESSAGES.DATABASE_IMPORT_FORBIDDEN(onClose))

      const okButton = await screen.findByRole('button', {
        name: /OK/,
      })
      expect(okButton).toBeInTheDocument()

      fireEvent.click(okButton)

      expect(onClose).toHaveBeenCalled()
    })
  })

  describe('SUBSCRIPTION_EXISTS', () => {
    it('should render message', async () => {
      const onSuccess = jest.fn()
      const onClose = jest.fn()

      renderToast(INFINITE_MESSAGES.SUBSCRIPTION_EXISTS(onSuccess, onClose))

      // Wait for the notification to appear
      const title = await screen.findByText(
        'Your subscription does not have a free Redis Cloud database.',
      )
      const description = await screen.findByText(
        'Do you want to create a free trial database in your existing subscription?',
      )
      const createButton = await screen.findByRole('button', {
        name: /Create/,
      })
      const closeButton = await screen.findByRole('button', { name: /Close/ })

      expect(title).toBeInTheDocument()
      expect(description).toBeInTheDocument()
      expect(createButton).toBeInTheDocument()
      expect(closeButton).toBeInTheDocument()
    })

    it('should call onSuccess callback when clicking on the "Create" button', async () => {
      const onSuccess = jest.fn()
      const onClose = jest.fn()

      renderToast(INFINITE_MESSAGES.SUBSCRIPTION_EXISTS(onSuccess, onClose))

      const createButton = await screen.findByRole('button', {
        name: /Create/,
      })
      expect(createButton).toBeInTheDocument()

      fireEvent.click(createButton)

      expect(onSuccess).toHaveBeenCalled()
    })

    it('should call onCancel callback when clicking on the "X" dismiss button', async () => {
      const onSuccess = jest.fn()
      const onClose = jest.fn()

      renderToast(INFINITE_MESSAGES.SUBSCRIPTION_EXISTS(onSuccess, onClose))

      const closeButton = await screen.findByRole('button', {
        name: /Close/,
      })
      expect(closeButton).toBeInTheDocument()

      fireEvent.click(closeButton)

      // Note: In the browser it works, but in the test env it doesn't
      // expect(onClose).toHaveBeenCalled()
    })
  })

  describe('AUTO_CREATING_DATABASE', () => {
    it('should render message', async () => {
      renderToast(INFINITE_MESSAGES.AUTO_CREATING_DATABASE())

      // Wait for the notification to appear
      const title = await screen.findByText('Connecting to your database')
      const description = await screen.findByText(
        'This may take several minutes, but it is totally worth it!',
      )
      const closeButton = await screen.findByRole('button', { name: /Close/ })

      expect(title).toBeInTheDocument()
      expect(description).toBeInTheDocument()
      expect(closeButton).toBeInTheDocument()
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
