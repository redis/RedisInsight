import React, { FormEvent, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  appContextPubSub,
  setPubSubFieldsContext,
} from 'uiSrc/slices/app/context'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import { publishMessageAction } from 'uiSrc/slices/pubsub/pubsub'
import { useConnectionType } from 'uiSrc/components/hooks/useConnectionType'

import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { ToastCheckIcon, Icon } from 'uiSrc/components/base/icons'
import { TextInput } from 'uiSrc/components/base/inputs'
import { Text } from 'uiSrc/components/base/text'
import { HorizontalSpacer, Spacer } from 'uiSrc/components/base/layout'
import { ChannelColumn } from './PublishMessage.styles'

const HIDE_BADGE_TIMER = 3000

const PublishMessage = () => {
  const { channel: channelContext, message: messageContext } =
    useSelector(appContextPubSub)
  const connectionType = useConnectionType()

  const [channel, setChannel] = useState<string>(channelContext)
  const [message, setMessage] = useState<string>(messageContext)
  const [isShowBadge, setIsShowBadge] = useState<boolean>(false)
  const [affectedClients, setAffectedClients] = useState<number>(0)

  const fieldsRef = useRef({ channel, message })
  const timeOutRef = useRef<NodeJS.Timeout>()

  const { instanceId } = useParams<{ instanceId: string }>()
  const dispatch = useDispatch()

  useEffect(
    () => () => {
      dispatch(setPubSubFieldsContext(fieldsRef.current))
      timeOutRef.current && clearTimeout(timeOutRef.current)
    },
    [],
  )

  useEffect(() => {
    fieldsRef.current = { channel, message }
  }, [channel, message])

  useEffect(() => {
    if (isShowBadge) {
      timeOutRef.current = setTimeout(() => {
        isShowBadge && setIsShowBadge(false)
      }, HIDE_BADGE_TIMER)

      return
    }

    timeOutRef.current && clearTimeout(timeOutRef.current)
  }, [isShowBadge])

  const onSuccess = (affected: number) => {
    setMessage('')
    setAffectedClients(affected)
    setIsShowBadge(true)
  }

  const onFormSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    setIsShowBadge(false)
    dispatch(publishMessageAction(instanceId, channel, message, onSuccess))
  }

  const getClientsText = (clients?: number) =>
    typeof clients !== 'number' ? 'Published' : `Published (${clients})`

  return (
    <form onSubmit={onFormSubmit}>
      <Row justify="between" gap="xl" align="end">
        <Row grow={true}>
          <ChannelColumn grow={false}>
            <Text>Channel name</Text>
            <Spacer size="s" />
            <FormField>
              <TextInput
                name="channel"
                id="channel"
                placeholder="Enter Channel Name"
                value={channel}
                onChange={(value) => setChannel(value)}
                autoComplete="off"
                data-testid="field-channel-name"
              />
            </FormField>
          </ChannelColumn>

          <HorizontalSpacer size="m" />

          <Col>
            <Text>Message</Text>
            <Spacer size="s" />
            <TextInput
              name="message"
              id="message"
              placeholder="Enter Message"
              value={message}
              onChange={(value) => setMessage(value)}
              autoComplete="off"
              data-testid="field-message"
            />
          </Col>
        </Row>

        {isShowBadge && (
          <Row grow={false} style={{ minHeight: 36 }} align="center">
            <Icon icon={ToastCheckIcon} color="success500" />
            <Text color="success">
              {getClientsText(
                connectionType !== ConnectionType.Cluster
                  ? affectedClients
                  : undefined,
              )}
            </Text>
          </Row>
        )}

        {!isShowBadge && (
          <Row justify="end" grow={false} style={{ minWidth: 100 }}>
            <FlexItem>
              <PrimaryButton
                size="large"
                type="submit"
                data-testid="publish-message-submit"
              >
                Publish
              </PrimaryButton>
            </FlexItem>
          </Row>
        )}
      </Row>
    </form>
  )
}

export default PublishMessage
