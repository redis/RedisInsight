import React, { useEffect } from 'react'
import { faker } from '@faker-js/faker'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { action } from 'storybook/actions'
import { useDispatch } from 'react-redux'

import {
  addMessageNotification,
  resetMessages,
} from 'uiSrc/slices/app/notifications'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { Row } from 'uiSrc/components/base/layout/flex'
import { stringToBuffer } from 'uiSrc/utils'
import { BulkActionsStatus, RedisDataType } from 'uiSrc/constants'

import Notifications from './Notifications'
import SUCCESS_MESSAGES from './success-messages'
import { BulkActionType } from 'apiSrc/modules/bulk-actions/constants'

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
      <Row gap="s" wrap>
        <PrimaryButton
          onClick={() => {
            dispatch(
              addMessageNotification(
                SUCCESS_MESSAGES.ADDED_NEW_INSTANCE(
                  faker.database.mongodbObjectId(),
                ),
              ),
            )
          }}
          size="small"
        >
          Added New Instance
        </PrimaryButton>
        <PrimaryButton
          onClick={() => {
            dispatch(
              addMessageNotification(
                SUCCESS_MESSAGES.ADDED_NEW_RDI_INSTANCE(
                  faker.database.mongodbObjectId(),
                ),
              ),
            )
          }}
          size="small"
        >
          Added New RDI Instance
        </PrimaryButton>
        <PrimaryButton
          onClick={() => {
            dispatch(
              addMessageNotification(
                SUCCESS_MESSAGES.DELETE_INSTANCE(
                  faker.database.mongodbObjectId(),
                ),
              ),
            )
          }}
          size="small"
        >
          Delete Instance
        </PrimaryButton>
        <PrimaryButton
          onClick={() => {
            dispatch(
              addMessageNotification(
                SUCCESS_MESSAGES.DELETE_RDI_INSTANCE(
                  faker.database.mongodbObjectId(),
                ),
              ),
            )
          }}
          size="small"
        >
          Delete RDI Instance
        </PrimaryButton>
        <PrimaryButton
          onClick={() => {
            const instanceNames = Array.from({ length: 12 }, () =>
              faker.database.mongodbObjectId(),
            )
            dispatch(
              addMessageNotification(
                SUCCESS_MESSAGES.DELETE_INSTANCES(instanceNames),
              ),
            )
          }}
          size="small"
        >
          Delete Multiple Instances
        </PrimaryButton>
        <PrimaryButton
          onClick={() => {
            const instanceNames = Array.from({ length: 12 }, () =>
              faker.database.mongodbObjectId(),
            )
            dispatch(
              addMessageNotification(
                SUCCESS_MESSAGES.DELETE_RDI_INSTANCES(instanceNames),
              ),
            )
          }}
          size="small"
        >
          Delete Multiple RDI Instances
        </PrimaryButton>
        <PrimaryButton
          onClick={() => {
            dispatch(
              addMessageNotification(
                SUCCESS_MESSAGES.ADDED_NEW_KEY(
                  stringToBuffer(faker.lorem.word()),
                ),
              ),
            )
          }}
          size="small"
        >
          Added New Key
        </PrimaryButton>
        <PrimaryButton
          onClick={() => {
            dispatch(
              addMessageNotification(
                SUCCESS_MESSAGES.DELETED_KEY(
                  stringToBuffer(faker.lorem.word()),
                ),
              ),
            )
          }}
          size="small"
        >
          Deleted Key
        </PrimaryButton>
        <PrimaryButton
          onClick={() => {
            dispatch(
              addMessageNotification(
                SUCCESS_MESSAGES.REMOVED_KEY_VALUE(
                  stringToBuffer(faker.lorem.word()),
                  stringToBuffer(faker.lorem.word()),
                  'Member',
                ),
              ),
            )
          }}
          size="small"
        >
          Removed Key Value
        </PrimaryButton>
        <PrimaryButton
          onClick={() => {
            const elements = Array.from({ length: 12 }, () =>
              stringToBuffer(faker.lorem.word()),
            )
            dispatch(
              addMessageNotification(
                SUCCESS_MESSAGES.REMOVED_LIST_ELEMENTS(
                  stringToBuffer(faker.lorem.word()),
                  elements.length,
                  elements,
                ),
              ),
            )
          }}
          size="small"
        >
          Removed List Elements
        </PrimaryButton>
        <PrimaryButton
          onClick={() => {
            dispatch(
              addMessageNotification(
                SUCCESS_MESSAGES.INSTALLED_NEW_UPDATE(
                  '2.70.0',
                  action('update link click'),
                ),
              ),
            )
          }}
          size="small"
        >
          Installed New Update
        </PrimaryButton>
        <PrimaryButton
          onClick={() => {
            dispatch(
              addMessageNotification(
                SUCCESS_MESSAGES.MESSAGE_ACTION(
                  faker.lorem.sentence(),
                  'claimed',
                ),
              ),
            )
          }}
          size="small"
        >
          Message Action
        </PrimaryButton>
        <PrimaryButton
          onClick={() => {
            dispatch(
              addMessageNotification(SUCCESS_MESSAGES.NO_CLAIMED_MESSAGES()),
            )
          }}
          size="small"
        >
          No Claimed Messages
        </PrimaryButton>
        <PrimaryButton
          onClick={() => {
            dispatch(addMessageNotification(SUCCESS_MESSAGES.CREATE_INDEX()))
          }}
          size="small"
        >
          Create Index
        </PrimaryButton>
        <PrimaryButton
          onClick={() => {
            dispatch(
              addMessageNotification(
                SUCCESS_MESSAGES.DELETE_INDEX(faker.lorem.word()),
              ),
            )
          }}
          size="small"
        >
          Delete Index
        </PrimaryButton>
        <PrimaryButton
          onClick={() => {
            dispatch(addMessageNotification(SUCCESS_MESSAGES.TEST_CONNECTION()))
          }}
          size="small"
        >
          Test Connection
        </PrimaryButton>
        <PrimaryButton
          onClick={() => {
            dispatch(
              addMessageNotification(
                SUCCESS_MESSAGES.UPLOAD_DATA_BULK(
                  {
                    id: faker.string.uuid(),
                    databaseId: faker.string.uuid(),
                    type: BulkActionType.Upload,
                    status: BulkActionsStatus.Completed,
                    filter: {
                      type: RedisDataType.String,
                      match: '*',
                    },
                    progress: {
                      total: 1000,
                      scanned: 1000,
                    },
                    summary: {
                      processed: 1000,
                      succeed: 950,
                      failed: 50,
                      errors: [],
                      keys: [],
                    },
                    duration: 12345,
                  },
                  'bulk-data.txt',
                ),
              ),
            )
          }}
          size="small"
        >
          Upload Data Bulk
        </PrimaryButton>
        <PrimaryButton
          onClick={() => {
            dispatch(
              addMessageNotification(
                SUCCESS_MESSAGES.DELETE_LIBRARY(faker.lorem.word()),
              ),
            )
          }}
          size="small"
        >
          Delete Library
        </PrimaryButton>
        <PrimaryButton
          onClick={() => {
            dispatch(
              addMessageNotification(
                SUCCESS_MESSAGES.ADD_LIBRARY(faker.lorem.word()),
              ),
            )
          }}
          size="small"
        >
          Add Library
        </PrimaryButton>
        <PrimaryButton
          onClick={() => {
            dispatch(
              addMessageNotification(SUCCESS_MESSAGES.REMOVED_ALL_CAPI_KEYS()),
            )
          }}
          size="small"
        >
          Removed All CAPI Keys
        </PrimaryButton>
        <PrimaryButton
          onClick={() => {
            dispatch(
              addMessageNotification(
                SUCCESS_MESSAGES.REMOVED_CAPI_KEY(faker.lorem.word()),
              ),
            )
          }}
          size="small"
        >
          Removed CAPI Key
        </PrimaryButton>
        <PrimaryButton
          onClick={() => {
            dispatch(
              addMessageNotification(
                SUCCESS_MESSAGES.DATABASE_ALREADY_EXISTS(),
              ),
            )
          }}
          size="small"
        >
          Database Already Exists
        </PrimaryButton>
        <PrimaryButton
          onClick={() => {
            dispatch(
              addMessageNotification(SUCCESS_MESSAGES.SUCCESS_RESET_PIPELINE()),
            )
          }}
          size="small"
        >
          Success Reset Pipeline
        </PrimaryButton>
        <PrimaryButton
          onClick={() => {
            dispatch(
              addMessageNotification(SUCCESS_MESSAGES.SUCCESS_TAGS_UPDATED()),
            )
          }}
          size="small"
        >
          Success Tags Updated
        </PrimaryButton>
      </Row>
    </>
  )
}

export const Messages: Story = {
  render: () => <MessageNotifications />,
}
