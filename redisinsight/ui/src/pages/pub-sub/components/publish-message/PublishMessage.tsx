import cx from 'classnames'
import React, {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  appContextPubSub,
  setPubSubFieldsContext,
} from 'uiSrc/slices/app/context'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import { publishMessageAction } from 'uiSrc/slices/pubsub/pubsub'
import { useConnectionType } from 'uiSrc/components/hooks/useConnectionType'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { FormField } from 'uiSrc/components/base/forms/FormField'
import { RiBadge } from 'uiSrc/components/base/display/badge/RiBadge'
import { CheckThinIcon } from 'uiSrc/components/base/icons'
import { RiIcon } from 'uiSrc/components/base/icons'
import { TextInput } from 'uiSrc/components/base/inputs'
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
      <FlexItem
        grow
        className={cx('flexItemNoFullWidth', 'inlineFieldsNoSpace')}
      >
        <Row align="center">
          <FlexItem className={styles.channelWrapper} grow>
            <FormField>
              <TextInput
                name="channel"
                id="channel"
                placeholder="Enter Channel Name"
                value={channel}
                onChange={value =>
                  setChannel(value)
                }
                autoComplete="off"
                data-testid="field-channel-name"
              />
            </FormField>
          </FlexItem>
          <FlexItem className={styles.messageWrapper} grow>
            <FormField>
              <>
                <TextInput
                  className={cx(styles.messageField, {
                    [styles.showBadge]: isShowBadge,
                  })}
                  name="message"
                  id="message"
                  placeholder="Enter Message"
                  value={message}
                  onChange={value =>
                    setMessage(value)
                  }
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
                    <Row align="center">
                      <span
                        className={styles.affectedClients}
                        data-testid="affected-clients"
                      >
                        {affectedClients}
                      </span>
                      <RiIcon type="UserIcon" />
                    </Row>
                  )}
                </RiBadge>
              </>
            </FormField>
          </FlexItem>
        </Row>
      </FlexItem>
      <Row justify="end" style={{ marginTop: 6 }}>
        <FlexItem>
          <PrimaryButton type="submit" data-testid="publish-message-submit">
            Publish
          </PrimaryButton>
        </FlexItem>
      </Row>
    </form>
  )
}

export default PublishMessage
