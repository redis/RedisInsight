import React, { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'

import { DeleteIcon } from 'uiSrc/components/base/icons'
import {
  getCapiKeysAction,
  oauthCapiKeysSelector,
  removeAllCapiKeysAction,
} from 'uiSrc/slices/oauth/cloud'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import {
  DestructiveButton,
  PrimaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { Title } from 'uiSrc/components/base/text/Title'
import { Text } from 'uiSrc/components/base/text'
import { Link } from 'uiSrc/components/base/link/Link'
import { RiPopover } from 'uiSrc/components/base'
import { EXTERNAL_LINKS, UTM_MEDIUMS } from 'uiSrc/constants/links'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import { Trans, useTranslation } from 'uiSrc/i18n'
import UserApiKeysTable from './components/user-api-keys-table'

import styles from './styles.module.scss'

const clearKeysCloudLink = getUtmExternalLink(
  EXTERNAL_LINKS.redisEnterpriseCloud,
  { medium: UTM_MEDIUMS.Settings, campaign: 'clear_keys' },
)

const CloudSettings = () => {
  const { t } = useTranslation()
  const { loading, data } = useAppSelector(oauthCapiKeysSelector)
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false)

  const dispatch = useAppDispatch()

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
      <Title className={styles.title} size="XS">
        {t('settings.cloud.title')}
      </Title>
      <Spacer size="s" />
      <Row gap="m" responsive>
        <FlexItem grow>
          <Text size="m" className={styles.smallText} color="primary">
            {t('settings.cloud.description.stored')}
          </Text>
          <Spacer size="xs" />
          <Text size="m" className={styles.smallText} color="primary">
            {t('settings.cloud.description.access')}
          </Text>
          <Text size="m" className={styles.smallText} color="primary">
            <Trans
              i18nKey="settings.cloud.description.delete"
              components={{
                cloudLink: (
                  <Link
                    color="primary"
                    target="_blank"
                    href={clearKeysCloudLink}
                  />
                ),
              }}
            />
          </Text>
        </FlexItem>
        <FlexItem grow={false}>
          <RiPopover
            anchorPosition="downCenter"
            ownFocus
            isOpen={isDeleteOpen}
            closePopover={() => setIsDeleteOpen(false)}
            panelPaddingSize="l"
            panelClassName={styles.deletePopover}
            button={
              <PrimaryButton
                size="small"
                onClick={handleClickDelete}
                disabled={loading || !data?.length}
                data-testid="delete-key-btn"
              >
                {t('settings.cloud.button.removeAll')}
              </PrimaryButton>
            }
          >
            <div className={styles.popoverDeleteContainer}>
              <Text size="m" component="div">
                <h4>{t('settings.cloud.removeAll.title')}</h4>
                <Trans
                  i18nKey="settings.cloud.description.delete"
                  components={{
                    cloudLink: (
                      <Link
                        target="_blank"
                        variant="inline"
                        color="text"
                        tabIndex={-1}
                        href={clearKeysCloudLink}
                      />
                    ),
                  }}
                />
              </Text>
              <Spacer />
              <div className={styles.popoverFooter}>
                <DestructiveButton
                  size="small"
                  icon={DeleteIcon}
                  onClick={handleDeleteAllKeys}
                  className={styles.popoverDeleteBtn}
                  data-testid="delete-key-confirm-btn"
                >
                  {t('settings.cloud.button.removeAll')}
                </DestructiveButton>
              </div>
            </div>
          </RiPopover>
        </FlexItem>
      </Row>
      <Spacer />
      <UserApiKeysTable items={data} loading={loading} />
    </div>
  )
}

export default CloudSettings
