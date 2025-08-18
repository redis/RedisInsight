import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { DeleteIcon } from 'uiBase/icons'
import { RiFlexItem, RiRow } from 'uiBase/layout'
import { RiSpacer } from 'uiBase/layout/spacer'
import { RiDestructiveButton, RiPrimaryButton } from 'uiBase/forms'
import { RiTitle, RiText } from 'uiBase/text'
import { RiLink } from 'uiBase/display'
import { RiPopover } from 'uiBase/index'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  getCapiKeysAction,
  oauthCapiKeysSelector,
  removeAllCapiKeysAction,
} from 'uiSrc/slices/oauth/cloud'
import UserApiKeysTable from './components/user-api-keys-table'

import styles from './styles.module.scss'

const CloudSettings = () => {
  const { loading, data } = useSelector(oauthCapiKeysSelector)
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false)

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getCapiKeysAction())
  }, [])

  const handleClickDelete = () => {
    setIsDeleteOpen(true)
    sendEventTelemetry({
      event: TelemetryEvent.SETTINGS_CLOUD_API_KEYS_REMOVE_CLICKED,
    })
  }

  const handleDeleteAllKeys = () => {
    setIsDeleteOpen(false)
    dispatch(
      removeAllCapiKeysAction(() => {
        sendEventTelemetry({
          event: TelemetryEvent.SETTINGS_CLOUD_API_KEYS_REMOVED,
        })
      }),
    )
  }

  return (
    <div className={styles.container}>
      <RiTitle className={styles.title} size="XS">
        API user keys
      </RiTitle>
      <RiSpacer size="s" />
      <RiRow gap="m" responsive>
        <RiFlexItem grow>
          <RiText size="s" className={styles.smallText} color="subdued">
            The list of API user keys that are stored locally in Redis Insight.{' '}
            <br />
            API user keys grant programmatic access to Redis Cloud. <br />
            {'To delete API keys from Redis Cloud, '}
            <RiLink
              target="_blank"
              color="text"
              href="https://redis.io/redis-enterprise-cloud/overview/?utm_source=redisinsight&utm_medium=settings&utm_campaign=clear_keys"
            >
              sign in to Redis Cloud
            </RiLink>
            {' and delete them manually.'}
          </RiText>
        </RiFlexItem>
        <RiFlexItem grow={false}>
          <RiPopover
            anchorPosition="downCenter"
            ownFocus
            isOpen={isDeleteOpen}
            closePopover={() => setIsDeleteOpen(false)}
            panelPaddingSize="l"
            panelClassName={styles.deletePopover}
            button={
              <RiPrimaryButton
                size="small"
                onClick={handleClickDelete}
                disabled={loading || !data?.length}
                data-testid="delete-key-btn"
              >
                Remove all API keys
              </RiPrimaryButton>
            }
          >
            <div className={styles.popoverDeleteContainer}>
              <RiText size="m" component="div">
                <h4>All API user keys will be removed from Redis Insight.</h4>
                {'To delete API keys from Redis Cloud, '}
                <RiLink
                  target="_blank"
                  color="text"
                  tabIndex={-1}
                  href="https://redis.io/redis-enterprise-cloud/overview/?utm_source=redisinsight&utm_medium=settings&utm_campaign=clear_keys"
                >
                  sign in to Redis Cloud
                </RiLink>
                {' and delete them manually.'}
              </RiText>
              <RiSpacer />
              <div className={styles.popoverFooter}>
                <RiDestructiveButton
                  size="small"
                  icon={DeleteIcon}
                  onClick={handleDeleteAllKeys}
                  className={styles.popoverDeleteBtn}
                  data-testid="delete-key-confirm-btn"
                >
                  Remove all API keys
                </RiDestructiveButton>
              </div>
            </div>
          </RiPopover>
        </RiFlexItem>
      </RiRow>
      <RiSpacer />
      <UserApiKeysTable items={data} loading={loading} />
    </div>
  )
}

export default CloudSettings
