import React, { useEffect } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import Notifications from './Notifications'
import { useDispatch } from 'react-redux'
import {
  addErrorNotification,
  addInfiniteNotification,
  addMessageNotification,
  resetErrors,
  resetMessages,
} from 'uiSrc/slices/app/notifications'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { faker } from '@faker-js/faker'
import { Text } from 'uiSrc/components/base/text'
import { Row } from 'uiSrc/components/base/layout/flex'
import { INFINITE_MESSAGES } from 'uiSrc/components/notifications/components'
import { fn } from 'storybook/test'
import { CloudJobName, CloudJobStep } from 'uiSrc/electron/constants'
import { OAuthProvider } from 'uiSrc/components/oauth/oauth-select-plan/constants'

const meta = {
  component: Notifications,
} satisfies Meta<typeof Notifications>

export default meta

type Story = StoryObj<typeof meta>

const MessageNotifications = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(resetMessages())
  }, [])

  return (
    <>
      <Notifications />
      <Row gap="m">
        <PrimaryButton
          onClick={() => {
            return dispatch(
              addMessageNotification({
                title: faker.word.words(3),
                message: (
                  <Text component="span">
                    <Text variant="semiBold" component="span">
                      {faker.lorem.sentence()}
                    </Text>
                  </Text>
                ),
              }),
            )
          }}
          size="small"
        >
          Trigger Message
        </PrimaryButton>
        {/*<SecondaryButton*/}
        {/*  onClick={() => {*/}
        {/*    return dispatch(resetMessages())*/}
        {/*  }}*/}
        {/*  size="small"*/}
        {/*>*/}
        {/*  Reset Messages*/}
        {/*</SecondaryButton>*/}
      </Row>
    </>
  )
}

const ErrorNotifications = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(resetErrors())
  }, [])

  return (
    <>
      <Notifications />
      <Row gap="m">
        <PrimaryButton
          onClick={() => {
            return dispatch(
              addErrorNotification({
                instanceId: faker.database.mongodbObjectId(),
                response: {
                  data: {
                    title: faker.word.words(3),
                    // @ts-ignore
                    name: faker.word.words(3),
                    additionalInfo: {},
                    message: faker.lorem.sentence(),
                  },
                },
              }),
            )
          }}
          size="small"
        >
          Trigger Error
        </PrimaryButton>
      </Row>
    </>
  )
}

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
                  () => fn(),
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
                  () => fn(),
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
                  () => fn(),
                  () => fn(),
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
                INFINITE_MESSAGES.DATABASE_IMPORT_FORBIDDEN(() => fn()),
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
                  () => fn(),
                  () => fn(),
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
                INFINITE_MESSAGES.APP_UPDATE_AVAILABLE('2.60.0', () => fn()),
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

export const Messages: Story = {
  render: () => <MessageNotifications />,
}

export const Errors: Story = {
  render: () => <ErrorNotifications />,
}

export const Infinite: Story = {
  render: () => <InfiniteNotifications />,
}
