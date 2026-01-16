import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  DeleteIcon,
  UserIcon,
  IndicatorExcludedIcon,
} from 'uiSrc/components/base/icons'
import {
  clearPubSubMessages,
  pubSubSelector,
  toggleSubscribeTriggerPubSub,
} from 'uiSrc/slices/pubsub/pubsub'

import { Button, IconButton } from 'uiSrc/components/base/forms/buttons'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { Row } from 'uiSrc/components/base/layout/flex'
import { DEFAULT_SEARCH_MATCH } from 'uiSrc/constants/api'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { RiTooltip } from 'uiSrc/components'
import type { SubscribeFormProps } from './SubscribeForm.types'
import * as S from './SubscribeForm.styles'
import SubscribeInformation from '../subscribe-information'

const SubscribeForm = (props: SubscribeFormProps) => {
  const dispatch = useDispatch()

  const { isSubscribed, subscriptions, loading, count } =
    useSelector(pubSubSelector)
  const { instanceId = '' } = useParams<{ instanceId: string }>()

  const [channels, setChannels] = useState(() =>
    subscriptions?.length
      ? subscriptions.map((sub) => sub.channel).join(' ')
      : DEFAULT_SEARCH_MATCH,
  )

  const onFocusOut = () => {
    if (!channels) {
      setChannels(DEFAULT_SEARCH_MATCH)
    }
  }

  const toggleSubscribe = () => {
    dispatch(toggleSubscribeTriggerPubSub(channels))
  }

  const onClickClear = () => {
    dispatch(clearPubSubMessages())
    return sendEventTelemetry({
      event: TelemetryEvent.PUBSUB_MESSAGES_CLEARED,
      eventData: {
        databaseId: instanceId,
        messages: count,
      },
    })
  }

  return (
    <Row align="center" gap="m" {...props}>
      <FormField>
        <S.TopicNameField
          value={channels}
          disabled={isSubscribed}
          onChange={(value) => setChannels(value)}
          onBlur={onFocusOut}
          placeholder="Enter Pattern"
          aria-label="channel names for filtering"
          data-testid="channels-input"
        />
      </FormField>

      <SubscribeInformation />

      <Button
        variant={isSubscribed ? 'secondary-ghost' : 'primary'}
        size="large"
        icon={isSubscribed ? IndicatorExcludedIcon : UserIcon}
        data-testid="subscribe-btn"
        onClick={toggleSubscribe}
        disabled={loading}
      >
        {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
      </Button>
      <RiTooltip content={!!count ? 'Clear Messages' : ''}>
        <IconButton
          disabled={!count}
          icon={DeleteIcon}
          onClick={onClickClear}
          aria-label="clear pub sub"
          data-testid="clear-pubsub-btn"
        />
      </RiTooltip>
    </Row>
  )
}

export default SubscribeForm
