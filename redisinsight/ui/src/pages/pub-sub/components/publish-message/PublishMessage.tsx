import cx from 'classnames'
import React, { FormEvent, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { RiFlexItem, RiRow } from 'uiBase/layout'
import { RiPrimaryButton, RiFormField } from 'uiBase/forms'
import { RiBadge } from 'uiBase/display'
import { CheckThinIcon, RiIcon } from 'uiBase/icons'
import { RiTextInput } from 'uiBase/inputs'
import { useConnectionType } from 'uiSrc/components/hooks/useConnectionType'
import { publishMessageAction } from 'uiSrc/slices/pubsub/pubsub'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import {
  appContextPubSub,
  setPubSubFieldsContext,
} from 'uiSrc/slices/app/context'
import styles from './styles.module.scss'

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

  return (
    <form className={styles.container} onSubmit={onFormSubmit}>
      <RiFlexItem
        grow
        className={cx('flexItemNoFullWidth', 'inlineFieldsNoSpace')}
      >
        <RiRow align="center">
          <RiFlexItem className={styles.channelWrapper} grow>
            <RiFormField>
              <RiTextInput
                name="channel"
                id="channel"
                placeholder="Enter Channel Name"
                value={channel}
                onChange={(value) => setChannel(value)}
                autoComplete="off"
                data-testid="field-channel-name"
              />
            </RiFormField>
          </RiFlexItem>
          <RiFlexItem className={styles.messageWrapper} grow>
            <RiFormField>
              <>
                <RiTextInput
                  className={cx(styles.messageField, {
                    [styles.showBadge]: isShowBadge,
                  })}
                  name="message"
                  id="message"
                  placeholder="Enter Message"
                  value={message}
                  onChange={(value) => setMessage(value)}
                  autoComplete="off"
                  data-testid="field-message"
                />
                <RiBadge
                  withIcon
                  icon={CheckThinIcon}
                  className={cx(styles.badge, { [styles.show]: isShowBadge })}
                  data-testid="affected-clients-badge"
                >
                  {connectionType !== ConnectionType.Cluster && (
                    <RiRow align="center">
                      <span
                        className={styles.affectedClients}
                        data-testid="affected-clients"
                      >
                        {affectedClients}
                      </span>
                      <RiIcon type="UserIcon" />
                    </RiRow>
                  )}
                </RiBadge>
              </>
            </RiFormField>
          </RiFlexItem>
        </RiRow>
      </RiFlexItem>
      <RiRow justify="end" style={{ marginTop: 6 }}>
        <RiFlexItem>
          <RiPrimaryButton type="submit" data-testid="publish-message-submit">
            Publish
          </RiPrimaryButton>
        </RiFlexItem>
      </RiRow>
    </form>
  )
}

export default PublishMessage
