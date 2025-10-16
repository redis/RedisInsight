import React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useDispatch } from 'react-redux'
import { action } from 'storybook/actions'

import { addInfiniteNotification } from 'uiSrc/slices/app/notifications'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { Row } from 'uiSrc/components/base/layout/flex'
import { INFINITE_MESSAGES } from 'uiSrc/components/notifications/components'
import { CloudJobName, CloudJobStep } from 'uiSrc/electron/constants'
import { OAuthProvider } from 'uiSrc/components/oauth/oauth-select-plan/constants'

import Notifications from './Notifications'

const meta = {
  component: Notifications,
} satisfies Meta<typeof Notifications>

export default meta

type Story = StoryObj<typeof meta>

const InfiniteNotifications = () => {
  const dispatch = useDispatch()

  return (
    <>
      <Notifications />
      <Row gap="s" wrap>
        <PrimaryButton
          onClick={() => {
            dispatch(
              addInfiniteNotification(INFINITE_MESSAGES.AUTHENTICATING()),
            )
          }}
          size="small"
        >
          Authenticating
        </PrimaryButton>
        <PrimaryButton
          onClick={() => {
            dispatch(
              addInfiniteNotification(
                INFINITE_MESSAGES.PENDING_CREATE_DB(CloudJobStep.Credentials),
              ),
            )
          }}
          size="small"
        >
          Pending Create DB (Credentials)
        </PrimaryButton>
        <PrimaryButton
          onClick={() => {
            dispatch(
              addInfiniteNotification(
                INFINITE_MESSAGES.PENDING_CREATE_DB(CloudJobStep.Subscription),
              ),
            )
          }}
          size="small"
        >
          Pending Create DB (Subscription)
        </PrimaryButton>
        <PrimaryButton
          onClick={() => {
            dispatch(
              addInfiniteNotification(
                INFINITE_MESSAGES.PENDING_CREATE_DB(CloudJobStep.Database),
              ),
            )
          }}
          size="small"
        >
          Pending Create DB (Database)
        </PrimaryButton>
        <PrimaryButton
          onClick={() => {
            dispatch(
              addInfiniteNotification(
                INFINITE_MESSAGES.PENDING_CREATE_DB(CloudJobStep.Import),
              ),
            )
          }}
          size="small"
        >
          Pending Create DB (Import)
        </PrimaryButton>
        <PrimaryButton
          onClick={() => {
            dispatch(
              addInfiniteNotification(
                INFINITE_MESSAGES.SUCCESS_CREATE_DB(
                  {
                    provider: OAuthProvider.AWS,
                    region: 'us-east-1',
                  },
                  action('create aws success'),
                  CloudJobName.CreateFreeDatabase,
                ),
              ),
            )
          }}
          size="small"
        >
          Success Create DB (AWS)
        </PrimaryButton>
        <PrimaryButton
          onClick={() => {
            dispatch(
              addInfiniteNotification(
                INFINITE_MESSAGES.SUCCESS_CREATE_DB(
                  {
                    provider: OAuthProvider.Google,
                    region: 'us-central1',
                  },
                  action('create gcp success'),
                  CloudJobName.CreateFreeSubscriptionAndDatabase,
                ),
              ),
            )
          }}
          size="small"
        >
          Success Create DB (GCP)
        </PrimaryButton>
        <PrimaryButton
          onClick={() => {
            dispatch(
              addInfiniteNotification(
                INFINITE_MESSAGES.DATABASE_EXISTS(
                  action('db exists success'),
                  action('db exists close'),
                ),
              ),
            )
          }}
          size="small"
        >
          Database Exists
        </PrimaryButton>
        <PrimaryButton
          onClick={() => {
            dispatch(
              addInfiniteNotification(
                INFINITE_MESSAGES.DATABASE_IMPORT_FORBIDDEN(
                  action('db import forbidden close'),
                ),
              ),
            )
          }}
          size="small"
        >
          Database Import Forbidden
        </PrimaryButton>
        <PrimaryButton
          onClick={() => {
            dispatch(
              addInfiniteNotification(
                INFINITE_MESSAGES.SUBSCRIPTION_EXISTS(
                  action('subscription exists success'),
                  action('subscription exists close'),
                ),
              ),
            )
          }}
          size="small"
        >
          Subscription Exists
        </PrimaryButton>
        <PrimaryButton
          onClick={() => {
            dispatch(
              addInfiniteNotification(
                INFINITE_MESSAGES.AUTO_CREATING_DATABASE(),
              ),
            )
          }}
          size="small"
        >
          Auto Creating Database
        </PrimaryButton>
        <PrimaryButton
          onClick={() => {
            dispatch(
              addInfiniteNotification(
                INFINITE_MESSAGES.APP_UPDATE_AVAILABLE(
                  '2.60.0',
                  action('app update available success'),
                ),
              ),
            )
          }}
          size="small"
        >
          App Update Available
        </PrimaryButton>
        <PrimaryButton
          onClick={() => {
            dispatch(
              addInfiniteNotification(
                INFINITE_MESSAGES.SUCCESS_DEPLOY_PIPELINE(),
              ),
            )
          }}
          size="small"
        >
          Success Deploy Pipeline
        </PrimaryButton>
      </Row>
    </>
  )
}

export const Infinite: Story = {
  render: () => <InfiniteNotifications />,
}
