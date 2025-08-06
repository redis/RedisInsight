import cx from 'classnames'
import React, { useContext, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { RiFlexItem, RiRow } from 'uiBase/layout'
import {
  UserIcon,
  IndicatorExcludedIcon,
  DeleteIcon,
  AllIconsType,
  RiIcon,
} from 'uiBase/icons'
import { Button, RiIconButton, RiFormField } from 'uiBase/forms'
import { RiText } from 'uiBase/text'
import { RiTextInput } from 'uiBase/inputs'
import { Theme } from 'uiSrc/constants'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import {
  clearPubSubMessages,
  pubSubSelector,
  toggleSubscribeTriggerPubSub,
} from 'uiSrc/slices/pubsub/pubsub'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import { DEFAULT_SEARCH_MATCH } from 'uiSrc/constants/api'
import { RiTooltip } from 'uiSrc/components'
import PatternsInfo from './components/patternsInfo'
import ClickableAppendInfo from './components/clickable-append-info'
import styles from './styles.module.scss'

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
    <RiRow
      className={styles.container}
      align="center"
      justify="between"
      gap="s"
    >
      <RiFlexItem>
        <RiRow align="center">
          <RiFlexItem className={styles.iconSubscribe}>
            <RiIcon
              className={styles.iconUser}
              type={isSubscribed ? subscribedIcon : notSubscribedIcon}
            />
          </RiFlexItem>
          <RiFlexItem>
            <RiText
              color="subdued"
              size="s"
              data-testid="subscribe-status-text"
            >
              You are {!isSubscribed && 'not'} subscribed
            </RiText>
          </RiFlexItem>
          {isSubscribed && (
            <RiFlexItem style={{ marginLeft: 12 }}>
              <PatternsInfo channels={channels} />
            </RiFlexItem>
          )}
          {displayMessages && (
            <RiFlexItem style={{ marginLeft: 12 }}>
              <RiText color="subdued" size="s" data-testid="messages-count">
                Messages: {count}
              </RiText>
            </RiFlexItem>
          )}
        </RiRow>
      </RiFlexItem>
      <RiFlexItem>
        <RiRow align="center">
          <RiFlexItem className={styles.channels}>
            <RiFormField additionalText={<ClickableAppendInfo />}>
              <RiTextInput
                value={channels}
                disabled={isSubscribed}
                onChange={(value) => setChannels(value)}
                onBlur={onFocusOut}
                placeholder="Enter Pattern"
                aria-label="channel names for filtering"
                data-testid="channels-input"
              />
            </RiFormField>
          </RiFlexItem>
          <RiFlexItem>
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
          </RiFlexItem>
          {!!messages.length && (
            <RiFlexItem style={{ marginLeft: 8 }}>
              <RiTooltip
                content="Clear Messages"
                anchorClassName={cx('inline-flex')}
              >
                <RiIconButton
                  icon={DeleteIcon}
                  onClick={onClickClear}
                  aria-label="clear pub sub"
                  data-testid="clear-pubsub-btn"
                />
              </RiTooltip>
            </RiFlexItem>
          )}
        </RiRow>
      </RiFlexItem>
    </RiRow>
  )
}

export default SubscriptionPanel
