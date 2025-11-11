import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  pubSubSelector,
  toggleSubscribeTriggerPubSub,
} from 'uiSrc/slices/pubsub/pubsub'

import { Button } from 'uiSrc/components/base/forms/buttons'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { TextInput } from 'uiSrc/components/base/inputs'
import { Row } from 'uiSrc/components/base/layout/flex'
import { DEFAULT_SEARCH_MATCH } from 'uiSrc/constants/api'

import { UserIcon, IndicatorExcludedIcon } from 'uiSrc/components/base/icons'
import { FlexProps } from 'uiSrc/components/base/layout/flex/flex.styles'
import SubscribeInformation from '../subscribe-information'

export interface SubscribeFormProps extends Omit<FlexProps, 'direction'> {}

const SubscribeForm = (props: SubscribeFormProps) => {
  const dispatch = useDispatch()

  const { isSubscribed, subscriptions, loading } = useSelector(pubSubSelector)

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

  return (
    <Row align="center" gap="m" {...props}>
      <FormField>
        <TextInput
          value={channels}
          disabled={isSubscribed}
          onChange={(value) => setChannels(value)}
          onBlur={onFocusOut}
          placeholder="Enter Pattern"
          aria-label="channel names for filtering"
          data-testid="channels-input"
          style={{ minWidth: 250 }}
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
    </Row>
  )
}

export default SubscribeForm
