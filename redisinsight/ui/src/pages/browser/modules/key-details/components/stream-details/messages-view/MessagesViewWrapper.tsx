import React, { useCallback, useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
import { last, toNumber } from 'lodash'
import cx from 'classnames'

import {
  fetchMoreConsumerMessages,
  selectedConsumerSelector,
  selectedGroupSelector,
  ackPendingEntriesAction,
  claimPendingMessages,
} from 'uiSrc/slices/browser/stream'
import {
  selectedKeyDataSelector,
  updateSelectedKeyRefreshTime,
} from 'uiSrc/slices/browser/keys'
import { ITableColumn } from 'uiSrc/components/virtual-table/interfaces'
import { getFormatTime, getNextId } from 'uiSrc/utils/streamUtils'
import { SortOrder, TEXT_CONSUMER_NAME_TOO_LONG } from 'uiSrc/constants'
import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { isTruncatedString } from 'uiSrc/utils'
import { Text } from 'uiSrc/components/base/text'
import { FlexItem } from 'uiSrc/components/base/layout/flex'
import {
  AckPendingEntriesResponse,
  PendingEntryDto,
  ClaimPendingEntryDto,
  ClaimPendingEntriesResponse,
} from 'apiSrc/modules/browser/stream/dto'

import MessagesView from './MessagesView'
import MessageClaimPopover from './MessageClaimPopover'
import MessageAckPopover from './MessageAckPopover'

import styles from './MessagesView/styles.module.scss'

const actionsWidth = 150
const minColumnWidth = 195
const claimPrefix = '-claim'
const ackPrefix = '-ack'

export interface Props {}

const MessagesViewWrapper = (props: Props) => {
  const {
    lastRefreshTime,
    data: loadedMessages = [],
    name: consumerName,
    pending = 0,
  } = useSelector(selectedConsumerSelector) ?? {}
  const isTruncatedConsumerName = isTruncatedString(consumerName)
  const { name: group } = useSelector(selectedGroupSelector) ?? { name: '' }
  const { name: key } = useSelector(selectedKeyDataSelector) ?? { name: '' }
  const { instanceId } = useParams<{ instanceId: string }>()

  const [openPopover, setOpenPopover] = useState<string>('')

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(updateSelectedKeyRefreshTime(lastRefreshTime))
  }, [])

  const showAchPopover = (id: string) => {
    setOpenPopover(id + ackPrefix)
  }

  const closePopover = () => {
    setOpenPopover('')
  }

  const handleCancelClaim = () => {
    sendEventTelemetry({
      event: TelemetryEvent.STREAM_CONSUMER_MESSAGE_CLAIM_CANCELED,
      eventData: {
        databaseId: instanceId,
        pending,
      },
    })
  }

  const showClaimPopover = (id: string) => {
    setOpenPopover(id + claimPrefix)
  }

  const onSuccessAck = (data: AckPendingEntriesResponse) => {
    sendEventTelemetry({
      event: TelemetryEvent.STREAM_CONSUMER_MESSAGE_ACKNOWLEDGED,
      eventData: {
        databaseId: instanceId,
        pending: pending - data.affected,
      },
    })
    setOpenPopover('')
  }

  const handleAchPendingMessage = (entry: string) => {
    dispatch(ackPendingEntriesAction(key, group, [entry], onSuccessAck))
  }

  const handleClaimingId = (
    data: Partial<ClaimPendingEntryDto>,
    onSuccess: (data: ClaimPendingEntriesResponse) => void,
  ) => {
    dispatch(claimPendingMessages(data, onSuccess))
  }
  const loadMoreItems = useCallback(() => {
    const lastLoadedEntryId = last(loadedMessages)?.id ?? '-'
    const nextId = `(${getNextId(lastLoadedEntryId, SortOrder.ASC)}`

    dispatch(fetchMoreConsumerMessages(SCAN_COUNT_DEFAULT, nextId))
  }, [loadedMessages])

  const columns: ITableColumn[] = [
    {
      id: 'id',
      label: 'Entry ID',
      absoluteWidth: minColumnWidth,
      minWidth: minColumnWidth,
      className: styles.cell,
      headerClassName: 'streamItemHeader',
      render: function Id(_name: string, { id }: PendingEntryDto) {
        const timestamp = id?.split('-')?.[0]
        return (
          <FlexItem>
            <Text
              color="secondary"
              size="s"
              style={{ maxWidth: '100%' }}
              className="truncateText streamItem"
              data-testid={`stream-message-${id}-date`}
            >
              {getFormatTime(timestamp)}
            </Text>
            <Text
              size="s"
              className="streamItemId"
              data-testid={`stream-message-${id}`}
              style={{ maxWidth: '100%' }}
            >
              {id}
            </Text>
          </FlexItem>
        )
      },
    },
    {
      id: 'idle',
      label: 'Last Message Delivered',
      minWidth: 256,
      absoluteWidth: 106,
      truncateText: true,
      headerClassName: 'streamItemHeader',
      headerCellClassName: 'truncateText',
      render: function Idle(_name: string, { id, idle }: PendingEntryDto) {
        const timestamp = id?.split('-')?.[0]
        return (
          <Text
            className="truncateText streamItem"
            color="secondary"
            size="s"
            data-testid={`stream-message-${id}-idle`}
            style={{ maxWidth: '100%' }}
          >
            {getFormatTime(`${toNumber(timestamp) + idle}`)}
          </Text>
        )
      },
    },
    {
      id: 'delivered',
      label: 'Times Message Delivered',
      minWidth: 106,
      truncateText: true,
      headerClassName: cx('streamItemHeader', styles.deliveredHeaderCell),
      headerCellClassName: 'truncateText',
      render: (cellData: number) => <Text color="secondary">{cellData}</Text>,
    },
    {
      id: 'actions',
      label: '',
      headerClassName: 'streamItemHeader',
      className: styles.actionCell,
      minWidth: actionsWidth,
      absoluteWidth: actionsWidth,
      render: function Actions(_act: any, { id }: PendingEntryDto) {
        return (
          <FlexItem direction="row">
            <MessageAckPopover
              id={id}
              isOpen={openPopover === id + ackPrefix}
              closePopover={() => closePopover()}
              showPopover={() => showAchPopover(id)}
              acknowledge={handleAchPendingMessage}
            />
            <MessageClaimPopover
              id={id}
              isOpen={openPopover === id + claimPrefix}
              closePopover={() => closePopover()}
              showPopover={() => showClaimPopover(id)}
              claimMessage={handleClaimingId}
              handleCancelClaim={handleCancelClaim}
            />
          </FlexItem>
        )
      },
    },
  ]

  return (
    <>
      <MessagesView
        data={loadedMessages}
        total={pending}
        columns={columns}
        onClosePopover={closePopover}
        loadMoreItems={loadMoreItems}
        {...props}
        noItemsMessageString={
          isTruncatedConsumerName ? TEXT_CONSUMER_NAME_TOO_LONG : undefined
        }
      />
    </>
  )
}

export default MessagesViewWrapper
