import React, { useEffect, useMemo, useState } from 'react'
import { useAppSelector } from 'uiSrc/slices/hooks'

import { useTranslation } from 'uiSrc/i18n'
import { connectedInstanceOverviewSelector } from 'uiSrc/slices/instances/instances'
import { pubSubSelector } from 'uiSrc/slices/pubsub/pubsub'
import { isVersionHigherOrEquals } from 'uiSrc/utils'
import { CommandsVersions } from 'uiSrc/constants/commandsVersions'
import { useConnectionType } from 'uiSrc/components/hooks/useConnectionType'
import { DEFAULT_SEARCH_MATCH } from 'uiSrc/constants/api'

import { Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { RiBadge } from 'uiSrc/components/base/display/badge/RiBadge'
import { HorizontalSpacer } from 'uiSrc/components/base/layout'
import { Table } from 'uiSrc/components/base/layout/table'
import { Wrapper } from './MessagesListTable.styles'
import {
  getDefaultPagination,
  getPubSubTableColumns,
  handlePaginationChange,
} from './MessagesListTable.config'
import { PubSubTableColumn } from './MessagesListTable.constants'
import PatternsInfo from '../../patternsInfo'
import SubscribeForm from '../../subscribe-form'
import EmptyMessagesList from '../EmptyMessagesList'

const MessagesListTable = () => {
  const { t } = useTranslation()
  const {
    messages = [],
    isSubscribed,
    subscriptions,
  } = useAppSelector(pubSubSelector)
  const connectionType = useConnectionType()
  const { version } = useAppSelector(connectedInstanceOverviewSelector)

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

  const columns = useMemo(() => getPubSubTableColumns(t), [t])

  if (hasMessages || isSubscribed) {
    return (
      <Wrapper gap="l">
        <Row align="center" justify="between" grow={false}>
          <Row align="center" gap="m">
            <PatternsInfo channels={channels} />

            <Row align="center" gap="s">
              <Text>{t('pubsub.messages.label')}</Text>
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
            <Text>{t('pubsub.status.label')}</Text>
            {isSubscribed ? (
              <RiBadge
                label={t('pubsub.status.subscribed')}
                variant="success"
              />
            ) : (
              <RiBadge
                label={t('pubsub.status.unsubscribed')}
                variant="default"
              />
            )}
            <HorizontalSpacer size="s" />

            <SubscribeForm grow={false} />
          </Row>
        </Row>

        <div data-testid="messages-list">
          <Table
            columns={columns}
            data={messages}
            stripedRows
            enableColumnResizing
            enableSorting
            paginationEnabled
            defaultSorting={[{ id: PubSubTableColumn.Timestamp, desc: true }]}
            onPaginationChange={handlePaginationChange}
            defaultPagination={getDefaultPagination()}
            emptyState={t('pubsub.table.empty')}
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
