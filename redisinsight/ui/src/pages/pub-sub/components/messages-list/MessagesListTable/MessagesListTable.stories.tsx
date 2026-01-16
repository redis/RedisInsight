import React, { useEffect } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useDispatch } from 'react-redux'

import { PubSubMessage } from 'uiSrc/slices/interfaces/pubsub'
import {
  concatPubSubMessages,
  setInitialPubSubState,
  setIsPubSubSubscribed,
  toggleSubscribeTriggerPubSub,
} from 'uiSrc/slices/pubsub/pubsub'
import { PubSubMessageFactory } from 'uiSrc/mocks/factories/pubsub/PubSubMessage.factory'
import {
  getDatabaseConfigInfoSuccess,
  setConnectedInstanceSuccess,
} from 'uiSrc/slices/instances/instances'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import { DBInstanceFactory } from 'uiSrc/mocks/factories/database/DBInstance.factory'
import MessagesListTable from './MessagesListTable'

interface MessagesListTableArgs {
  messages?: PubSubMessage[]
  isSubscribed?: boolean
  subscriptions?: string
  connectionType?: ConnectionType
  version?: string
}

const SAMPLE_MESSAGES: PubSubMessage[] = PubSubMessageFactory.buildList(20)

const StorePopulator = ({ args }: { args: MessagesListTableArgs }) => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setInitialPubSubState())

    const instance = DBInstanceFactory.build({
      connectionType: args.connectionType ?? ConnectionType.Standalone,
      version: args.version ?? '7.2.0',
    })

    dispatch(setConnectedInstanceSuccess(instance))
    dispatch(
      getDatabaseConfigInfoSuccess({
        version: args.version ?? '7.2.0',
      } as any),
    )

    if (args.subscriptions) {
      dispatch(toggleSubscribeTriggerPubSub(args.subscriptions))
    }

    if (args.isSubscribed) {
      dispatch(setIsPubSubSubscribed())
    }

    if (args.messages?.length) {
      dispatch(
        concatPubSubMessages({
          messages: args.messages,
          count: args.messages.length,
        }),
      )
    }
  }, [dispatch, args])

  return null
}

const meta: Meta<typeof MessagesListTable> = {
  component: MessagesListTable,
  decorators: [
    (Story, context) => {
      const storeArgs =
        (context.parameters?.storeArgs as MessagesListTableArgs) || {}

      return (
        <>
          <StorePopulator args={storeArgs} />
          <Story />
        </>
      )
    },
  ],
}

export default meta

type Story = StoryObj<typeof meta>

export const WithMessages: Story = {
  parameters: {
    storeArgs: {
      isSubscribed: true,
      subscriptions: 'news:*',
      messages: SAMPLE_MESSAGES,
    } as MessagesListTableArgs,
  },
}
