import cx from 'classnames'
import React, { useContext, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { Theme } from 'uiSrc/constants'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import {
  clearPubSubMessages,
  pubSubSelector,
  toggleSubscribeTriggerPubSub,
} from 'uiSrc/slices/pubsub/pubsub'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import { DEFAULT_SEARCH_MATCH } from 'uiSrc/constants/api'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import {
  UserIcon,
  IndicatorExcludedIcon,
  DeleteIcon,
} from 'uiSrc/components/base/icons'
import { Button, IconButton } from 'uiSrc/components/base/forms/buttons'
import { Text } from 'uiSrc/components/base/text'
import { RiTooltip } from 'uiSrc/components'
import { AllIconsType, RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { TextInput } from 'uiSrc/components/base/inputs'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import ClickableAppendInfo from './components/clickable-append-info'
import styles from './styles.module.scss'
import PatternsInfo from '../patternsInfo'

const SubscriptionPanel = () => {
  const { messages, isSubscribed, subscriptions, loading, count } =
    useSelector(pubSubSelector)

  const dispatch = useDispatch()
  const { theme } = useContext(ThemeContext)

  const { instanceId = '' } = useParams<{ instanceId: string }>()

  const [channels, setChannels] = useState(
    subscriptions?.length
      ? subscriptions.map((sub) => sub.channel).join(' ')
      : DEFAULT_SEARCH_MATCH,
  )

  const toggleSubscribe = () => {
    dispatch(toggleSubscribeTriggerPubSub(channels))
  }

  const onClickClear = () => {
    dispatch(clearPubSubMessages())
    sendEventTelemetry({
      event: TelemetryEvent.PUBSUB_MESSAGES_CLEARED,
      eventData: {
        databaseId: instanceId,
        messages: count,
      },
    })
  }

  const onFocusOut = () => {
    if (!channels) {
      setChannels(DEFAULT_SEARCH_MATCH)
    }
  }

  const subscribedIcon: AllIconsType =
    theme === Theme.Dark ? 'SubscribedDarkIcon' : 'SubscribedLightIcon'
  const notSubscribedIcon =
    theme === Theme.Dark ? 'NotSubscribedDarkIcon' : 'NotSubscribedLightIcon'

  const displayMessages = count !== 0 || isSubscribed

  return (
    <Row className={styles.container} align="center" justify="between" gap="s">
      <FlexItem>
        <Row align="center">
          <FlexItem className={styles.iconSubscribe}>
            <RiIcon
              className={styles.iconUser}
              type={isSubscribed ? subscribedIcon : notSubscribedIcon}
            />
          </FlexItem>
          <FlexItem>
            <Text color="subdued" size="s" data-testid="subscribe-status-text">
              You are {!isSubscribed && 'not'} subscribed
            </Text>
          </FlexItem>
          {isSubscribed && (
            <FlexItem style={{ marginLeft: 12 }}>
              <PatternsInfo channels={channels} />
            </FlexItem>
          )}
          {displayMessages && (
            <FlexItem style={{ marginLeft: 12 }}>
              <Text color="subdued" size="s" data-testid="messages-count">
                Messages: {count}
              </Text>
            </FlexItem>
          )}
        </Row>
      </FlexItem>
      <FlexItem>
        <Row align="center">
          <FlexItem>
            <ClickableAppendInfo />
          </FlexItem>
          <FlexItem className={styles.channels}>
            <FormField>
              <TextInput
                value={channels}
                disabled={isSubscribed}
                onChange={(value) => setChannels(value)}
                onBlur={onFocusOut}
                placeholder="Enter Pattern"
                aria-label="channel names for filtering"
                data-testid="channels-input"
              />
            </FormField>
          </FlexItem>
          <FlexItem>
            <Button
              variant={isSubscribed ? 'secondary-ghost' : 'primary'}
              size="s"
              icon={isSubscribed ? IndicatorExcludedIcon : UserIcon}
              data-testid="subscribe-btn"
              onClick={toggleSubscribe}
              disabled={loading}
            >
              Subscribe
            </Button>
          </FlexItem>
          {!!messages.length && (
            <FlexItem style={{ marginLeft: 8 }}>
              <RiTooltip
                content="Clear Messages"
                anchorClassName={cx('inline-flex')}
              >
                <IconButton
                  icon={DeleteIcon}
                  onClick={onClickClear}
                  aria-label="clear pub sub"
                  data-testid="clear-pubsub-btn"
                />
              </RiTooltip>
            </FlexItem>
          )}
        </Row>
      </FlexItem>
    </Row>
  )
}

export default SubscriptionPanel
