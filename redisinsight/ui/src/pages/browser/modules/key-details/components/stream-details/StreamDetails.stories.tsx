import React, { useEffect } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useDispatch } from 'react-redux'
import { fn } from 'storybook/test'

import { loadKeyInfoSuccess, setViewFormat } from 'uiSrc/slices/browser/keys'
import {
  loadEntriesSuccess,
  loadConsumerGroupsSuccess,
  setStreamViewType,
  loadConsumersSuccess,
  loadConsumerMessagesSuccess,
  setSelectedGroup,
  setSelectedConsumer,
} from 'uiSrc/slices/browser/stream'
import { setConnectedInstanceSuccess } from 'uiSrc/slices/instances/instances'
import { StreamViewType } from 'uiSrc/slices/interfaces/stream'
import { KeyTypes, SortOrder, KeyValueFormat } from 'uiSrc/constants'
import { StreamDetails } from './index'

interface StreamDetailsArgs {
  viewType?: StreamViewType
  hasEntries?: boolean
  hasGroups?: boolean
  hasConsumers?: boolean
  hasMessages?: boolean
  isLoading?: boolean
}

const StorePopulator = ({ args }: { args: StreamDetailsArgs }) => {
  const dispatch = useDispatch()

  useEffect(() => {
    const {
      viewType = StreamViewType.Data,
      hasEntries = true,
      hasGroups = false,
      hasConsumers = false,
      hasMessages = false,
      isLoading = false,
    } = args

    // eslint-disable-next-line no-console
    console.log('🚀 StorePopulator running with:', {
      viewType,
      hasEntries,
      hasGroups,
      hasConsumers,
      hasMessages,
      isLoading,
    })

    // Set up connected instance
    dispatch(
      setConnectedInstanceSuccess({
        id: 'test-instance-id',
        compressor: null,
      } as any),
    )
    // eslint-disable-next-line no-console
    console.log('✅ Connected instance set')

    // Set up selected key
    dispatch(
      loadKeyInfoSuccess({
        name: Buffer.from('mystream'),
        type: KeyTypes.Stream,
        ttl: -1,
        size: 1024,
        length: hasEntries ? 150 : 0,
      } as any),
    )

    // Set view format for proper field rendering
    dispatch(setViewFormat(KeyValueFormat.Unicode))
    // eslint-disable-next-line no-console
    console.log('✅ View format set to Unicode')

    // Set stream view type
    dispatch(setStreamViewType(viewType))
    // eslint-disable-next-line no-console
    console.log('✅ Stream view type set to:', viewType)

    // Load stream entries if in Data view
    if (viewType === StreamViewType.Data && hasEntries && !isLoading) {
      const streamData = {
        total: 150,
        keyName: Buffer.from('mystream'),
        keyNameString: 'mystream',
        lastGeneratedId: '1234567890123-5',
        lastRefreshTime: Date.now(),
        firstEntry: {
          id: '1234567890100-0',
          fields: [
            {
              name: Buffer.from('temperature'),
              value: Buffer.from('25.5'),
            },
            {
              name: Buffer.from('humidity'),
              value: Buffer.from('60'),
            },
          ],
        },
        lastEntry: {
          id: '1234567890123-5',
          fields: [
            {
              name: Buffer.from('temperature'),
              value: Buffer.from('26.2'),
            },
            {
              name: Buffer.from('humidity'),
              value: Buffer.from('58'),
            },
          ],
        },
        entries: [
          {
            id: '1234567890123-5',
            fields: [
              {
                name: Buffer.from('temperature'),
                value: Buffer.from('26.2'),
              },
              {
                name: Buffer.from('humidity'),
                value: Buffer.from('58'),
              },
              {
                name: Buffer.from('location'),
                value: Buffer.from('room-1'),
              },
            ],
          },
          {
            id: '1234567890122-0',
            fields: [
              {
                name: Buffer.from('temperature'),
                value: Buffer.from('25.8'),
              },
              {
                name: Buffer.from('humidity'),
                value: Buffer.from('59'),
              },
              {
                name: Buffer.from('location'),
                value: Buffer.from('room-1'),
              },
            ],
          },
          {
            id: '1234567890121-0',
            fields: [
              {
                name: Buffer.from('temperature'),
                value: Buffer.from('25.5'),
              },
              {
                name: Buffer.from('humidity'),
                value: Buffer.from('60'),
              },
              {
                name: Buffer.from('location'),
                value: Buffer.from('room-1'),
              },
            ],
          },
        ],
      }

      // eslint-disable-next-line no-console
      console.log('📊 Dispatching stream data:', streamData)
      dispatch(loadEntriesSuccess([streamData, SortOrder.DESC] as any))
      // eslint-disable-next-line no-console
      console.log('✅ Stream data dispatched')
    }

    // Load consumer groups if in Groups view
    if (viewType === StreamViewType.Groups && hasGroups && !isLoading) {
      dispatch(
        loadConsumerGroupsSuccess([
          {
            name: Buffer.from('analytics-group'),
            nameString: 'analytics-group',
            consumers: 3,
            pending: 12,
            lastDeliveredId: '1234567890120-0',
            smallestPendingId: '1234567890110-0',
            greatestPendingId: '1234567890120-0',
          },
          {
            name: Buffer.from('notifications-group'),
            nameString: 'notifications-group',
            consumers: 2,
            pending: 5,
            lastDeliveredId: '1234567890123-5',
            smallestPendingId: '1234567890118-0',
            greatestPendingId: '1234567890123-5',
          },
          {
            name: Buffer.from('backup-group'),
            nameString: 'backup-group',
            consumers: 1,
            pending: 0,
            lastDeliveredId: '1234567890123-5',
            smallestPendingId: null,
            greatestPendingId: null,
          },
        ] as any),
      )
    }

    // Load consumers if in Consumers view
    if (viewType === StreamViewType.Consumers && hasConsumers && !isLoading) {
      const selectedGroup = {
        name: Buffer.from('analytics-group'),
        nameString: 'analytics-group',
        data: [
          {
            name: Buffer.from('consumer-1'),
            nameString: 'consumer-1',
            pending: 8,
            idle: 120000,
          },
          {
            name: Buffer.from('consumer-2'),
            nameString: 'consumer-2',
            pending: 4,
            idle: 60000,
          },
          {
            name: Buffer.from('consumer-3'),
            nameString: 'consumer-3',
            pending: 0,
            idle: 300000,
          },
        ],
        selectedConsumer: null,
        lastRefreshTime: Date.now(),
      }

      dispatch(setSelectedGroup(selectedGroup as any))
      dispatch(loadConsumersSuccess(selectedGroup.data as any))
    }

    // Load messages if in Messages view
    if (viewType === StreamViewType.Messages && hasMessages && !isLoading) {
      const selectedGroup = {
        name: Buffer.from('analytics-group'),
        nameString: 'analytics-group',
        data: [],
        selectedConsumer: {
          name: Buffer.from('consumer-1'),
          nameString: 'consumer-1',
          pending: 8,
          idle: 120000,
          data: [
            {
              id: '1234567890120-0',
              consumerName: Buffer.from('consumer-1'),
              consumerNameString: 'consumer-1',
              idle: 120000,
              delivered: 2,
            },
            {
              id: '1234567890118-0',
              consumerName: Buffer.from('consumer-1'),
              consumerNameString: 'consumer-1',
              idle: 150000,
              delivered: 3,
            },
          ],
          lastRefreshTime: Date.now(),
        },
        lastRefreshTime: Date.now(),
      }

      dispatch(
        setSelectedGroup({ ...selectedGroup, selectedConsumer: null } as any),
      )
      dispatch(setSelectedConsumer(selectedGroup.selectedConsumer as any))
      dispatch(
        loadConsumerMessagesSuccess(selectedGroup.selectedConsumer.data as any),
      )
    }
  }, [dispatch, args])

  return null
}

const meta: Meta<typeof StreamDetails> = {
  component: StreamDetails,
  decorators: [
    (Story, context) => {
      const storeArgs =
        (context.parameters?.storeArgs as StreamDetailsArgs) || {}

      return (
        <>
          <StorePopulator args={storeArgs} />
          <Story />
        </>
      )
    },
  ],
  args: {
    onCloseKey: fn(),
    onRemoveKey: fn(),
    onEditKey: fn(),
    onOpenAddItemPanel: fn(),
    onCloseAddItemPanel: fn(),
    isFullScreen: false,
    arePanelsCollapsed: false,
    onToggleFullScreen: fn(),
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const DataView: Story = {
  parameters: {
    storeArgs: {
      viewType: StreamViewType.Data,
      hasEntries: true,
    } as StreamDetailsArgs,
  },
}

export const DataViewEmpty: Story = {
  parameters: {
    storeArgs: {
      viewType: StreamViewType.Data,
      hasEntries: false,
    } as StreamDetailsArgs,
  },
}

export const GroupsView: Story = {
  parameters: {
    storeArgs: {
      viewType: StreamViewType.Groups,
      hasGroups: true,
    } as StreamDetailsArgs,
  },
}

export const GroupsViewEmpty: Story = {
  parameters: {
    storeArgs: {
      viewType: StreamViewType.Groups,
      hasGroups: false,
    } as StreamDetailsArgs,
  },
}

export const ConsumersView: Story = {
  parameters: {
    storeArgs: {
      viewType: StreamViewType.Consumers,
      hasConsumers: true,
    } as StreamDetailsArgs,
  },
}

export const ConsumersViewEmpty: Story = {
  parameters: {
    storeArgs: {
      viewType: StreamViewType.Consumers,
      hasConsumers: false,
    } as StreamDetailsArgs,
  },
}

export const MessagesView: Story = {
  parameters: {
    storeArgs: {
      viewType: StreamViewType.Messages,
      hasMessages: true,
    } as StreamDetailsArgs,
  },
}

export const MessagesViewEmpty: Story = {
  parameters: {
    storeArgs: {
      viewType: StreamViewType.Messages,
      hasMessages: false,
    } as StreamDetailsArgs,
  },
}

export const FullScreen: Story = {
  args: {
    isFullScreen: true,
  },
  parameters: {
    storeArgs: {
      viewType: StreamViewType.Data,
      hasEntries: true,
    } as StreamDetailsArgs,
  },
}

export const LoadingState: Story = {
  parameters: {
    storeArgs: {
      viewType: StreamViewType.Data,
      isLoading: true,
    } as StreamDetailsArgs,
  },
}
