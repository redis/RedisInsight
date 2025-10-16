import React from 'react'
import { faker } from '@faker-js/faker'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { action } from 'storybook/actions'

import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { Row } from 'uiSrc/components/base/layout/flex'

import Notifications from './Notifications'
import ERROR_MESSAGES from './error-messages'

const meta = {
  component: Notifications,
} satisfies Meta<typeof Notifications>

export default meta

type Story = StoryObj<typeof meta>

const ErrorNotifications = () => {
  return (
    <>
      <Notifications />
      <Row gap="s" wrap>
        <PrimaryButton
          onClick={() => {
            ERROR_MESSAGES.DEFAULT(
              faker.lorem.sentence(),
              action('default error close'),
              'Error',
            )
          }}
          size="small"
        >
          Default Error
        </PrimaryButton>
        <PrimaryButton
          onClick={() => {
            ERROR_MESSAGES.ENCRYPTION(
              action('encryption error close'),
              faker.database.mongodbObjectId(),
            )
          }}
          size="small"
        >
          Encryption Error
        </PrimaryButton>
        <PrimaryButton
          onClick={() => {
            ERROR_MESSAGES.CLOUD_CAPI_KEY_UNAUTHORIZED(
              {
                message: 'Your API key is unauthorized to access this resource',
                title: 'Unauthorized',
              },
              {
                resourceId: faker.string.uuid(),
              },
              action('cloud capi unauthorized close'),
            )
          }}
          size="small"
        >
          Cloud CAPI Unauthorized
        </PrimaryButton>
        <PrimaryButton
          onClick={() => {
            ERROR_MESSAGES.RDI_DEPLOY_PIPELINE(
              {
                title: 'Pipeline deployment failed',
                message: faker.lorem.paragraph(),
              },
              action('rdi deploy error close'),
            )
          }}
          size="small"
        >
          RDI Deploy Pipeline Error
        </PrimaryButton>
      </Row>
    </>
  )
}

export const Errors: Story = {
  render: () => <ErrorNotifications />,
}
