import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import AutoSizer from 'react-virtualized-auto-sizer'

import { connectedInstanceOverviewSelector } from 'uiSrc/slices/instances/instances'
import { pubSubSelector } from 'uiSrc/slices/pubsub/pubsub'
import { isVersionHigherOrEquals } from 'uiSrc/utils'
import { CommandsVersions } from 'uiSrc/constants/commandsVersions'
import { useConnectionType } from 'uiSrc/components/hooks/useConnectionType'
import { DEFAULT_SEARCH_MATCH } from 'uiSrc/constants/api'
import EmptyMessagesList from './EmptyMessagesList'
import MessagesList from './MessagesList'

import { Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { RiBadge } from 'uiSrc/components/base/display/badge/RiBadge'
import { HorizontalSpacer } from 'uiSrc/components/base/layout'
import SubscribeForm from '../subscribe-form'
import PatternsInfo from '../patternsInfo'
import { InnerContainer, Wrapper } from './MessageListWrapper.styles'

const MessagesListWrapper = () => {
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
      <Wrapper>
        <Row align="center" justify="between" grow={false}>
          <Row align="center" gap="m">
            <PatternsInfo channels={channels} />

            <Row align="center" gap="s">
              <Text>Messages:</Text>
              <Text>{messages.length}</Text>
            </Row>
          </Row>

          <Row align="center" justify="end" gap="s">
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

        <InnerContainer grow={true} data-testid="messages-list" gap="m">
          <Row grow={false}>
            <Text>Timestamp</Text>
            <HorizontalSpacer />
            <Text>Channel</Text>
            <HorizontalSpacer />
            <Text>Message</Text>
          </Row>

          {hasMessages && (
            <AutoSizer>
              {({ width, height }) => (
                <MessagesList items={messages} width={width} height={height} />
              )}
            </AutoSizer>
          )}

          {!hasMessages && (
            <Row grow={false} justify="center">
              <Text>No messages published yet</Text>
            </Row>
          )}
        </InnerContainer>
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

export default MessagesListWrapper
