import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { connectedInstanceOverviewSelector } from 'uiSrc/slices/instances/instances'
import { pubSubSelector } from 'uiSrc/slices/pubsub/pubsub'
import { isVersionHigherOrEquals } from 'uiSrc/utils'
import { CommandsVersions } from 'uiSrc/constants/commandsVersions'
import { useConnectionType } from 'uiSrc/components/hooks/useConnectionType'
import { DEFAULT_SEARCH_MATCH } from 'uiSrc/constants/api'
import EmptyMessagesList from '../EmptyMessagesList'

import { Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { RiBadge } from 'uiSrc/components/base/display/badge/RiBadge'
import { HorizontalSpacer } from 'uiSrc/components/base/layout'
import SubscribeForm from '../../subscribe-form'
import PatternsInfo from '../../patternsInfo'
import { Wrapper } from './MessagesListTable.styles'
import { Table } from 'uiSrc/components/base/layout/table'
import {
  getDefaultPagination,
  handlePaginationChange,
  PUB_SUB_TABLE_COLUMNS,
} from './MessagesListTable.config'
import { PubSubTableColumn } from './MessagesListTable.constants'

const MessagesListTable = () => {
  const {
    messages = [],
    isSubscribed,
    subscriptions,
  } = useSelector(pubSubSelector)
  const connectionType = useConnectionType()
  const { version } = useSelector(connectedInstanceOverviewSelector)

  const channels = subscriptions?.length
    ? subscriptions.map((sub) => sub.channel).join(' ')
    : DEFAULT_SEARCH_MATCH

  const [isSpublishNotSupported, setIsSpublishNotSupported] =
    useState<boolean>(true)

  useEffect(() => {
    setIsSpublishNotSupported(
      isVersionHigherOrEquals(
        version,
        CommandsVersions.SPUBLISH_NOT_SUPPORTED.since,
      ),
    )
  }, [version])

  const hasMessages = messages.length > 0

  if (hasMessages || isSubscribed) {
    return (
      <Wrapper gap="l">
        <Row align="center" justify="between" grow={false}>
          <Row align="center" gap="m">
            <PatternsInfo channels={channels} />

            <Row align="center" gap="s">
              <Text>Messages:</Text>
              <Text data-testid="pub-sub-messages-count">
                {messages.length}
              </Text>
            </Row>
          </Row>

          <Row
            align="center"
            justify="end"
            gap="s"
            data-testid="pub-sub-status"
          >
            <Text>Status:</Text>
            {isSubscribed ? (
              <RiBadge label="Subscribed" variant="success" />
            ) : (
              <RiBadge label="Unsubscribed" variant="default" />
            )}
            <HorizontalSpacer size="s" />

            <SubscribeForm grow={false} />
          </Row>
        </Row>

        <div data-testid="messages-list">
          <Table
            columns={PUB_SUB_TABLE_COLUMNS}
            data={messages}
            stripedRows
            enableSorting
            paginationEnabled
            defaultSorting={[{ id: PubSubTableColumn.Timestamp, desc: true }]}
            onPaginationChange={handlePaginationChange}
            defaultPagination={getDefaultPagination()}
            emptyState="No messages published yet"
          />
        </div>
      </Wrapper>
    )
  }

  return (
    <EmptyMessagesList
      isSpublishNotSupported={isSpublishNotSupported}
      connectionType={connectionType}
    />
  )
}

export default MessagesListTable
