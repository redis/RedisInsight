import React, { useCallback, useState } from 'react'
import { format } from 'date-fns'
import { useAppDispatch } from 'uiSrc/slices/hooks'
import { isNull } from 'lodash'

import { formatLongName, Nullable } from 'uiSrc/utils'
import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { OAuthSsoHandlerDialog, RiTooltip } from 'uiSrc/components'
import {
  CloudCapiKey,
  OAuthSocialAction,
  OAuthSocialSource,
} from 'uiSrc/slices/interfaces'
import { removeCapiKeyAction } from 'uiSrc/slices/oauth/cloud'
import { Text } from 'uiSrc/components/base/text'

import { EmptyButton, PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { CopyButton } from 'uiSrc/components/copy-button'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { Title } from 'uiSrc/components/base/text/Title'
import { Table, ColumnDef } from 'uiSrc/components/base/layout/table'
import { Link } from 'uiSrc/components/base/link/Link'
import { Row } from 'uiSrc/components/base/layout/flex'
import { EXTERNAL_LINKS, UTM_MEDIUMS } from 'uiSrc/constants/links'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import { Trans, useTranslation } from 'uiSrc/i18n'
import styles from './styles.module.scss'

const clearKeysCloudLink = getUtmExternalLink(
  EXTERNAL_LINKS.redisEnterpriseCloud,
  { medium: UTM_MEDIUMS.Settings, campaign: 'clear_keys' },
)

export interface Props {
  items: Nullable<CloudCapiKey[]>
  loading: boolean
}

const UserApiKeysTable = ({ items, loading }: Props) => {
  const { t } = useTranslation()
  const [deleting, setDeleting] = useState('')
  const dispatch = useAppDispatch()

  const handleCopy = () => {
    sendEventTelemetry({
      event: TelemetryEvent.SETTINGS_CLOUD_API_KEY_NAME_COPIED,
    })
  }

  const showPopover = useCallback((id = '') => {
    setDeleting(id)
  }, [])

  const handleClickDeleteApiKey = () => {
    sendEventTelemetry({
      event: TelemetryEvent.SETTINGS_CLOUD_API_KEY_REMOVE_CLICKED,
      eventData: {
        source: OAuthSocialSource.SettingsPage,
      },
    })
  }

  const handleDeleteApiKey = (id: string, name: string) => {
    setDeleting('')
    dispatch(
      removeCapiKeyAction({ id, name }, () => {
        sendEventTelemetry({
          event: TelemetryEvent.CLOUD_API_KEY_REMOVED,
          eventData: {
            source: OAuthSocialSource.SettingsPage,
          },
        })
      }),
    )
  }

  const columns: ColumnDef<CloudCapiKey>[] = [
    {
      header: t('settings.cloud.table.name'),
      id: 'name',
      accessorKey: 'name',
      enableSorting: true,
      cell: ({
        row: {
          original: { name, valid },
        },
      }) => {
        const tooltipContent = formatLongName(name)
        return (
          <div className={styles.nameField}>
            {!valid && (
              <RiTooltip
                content={t('settings.cloud.table.invalidTooltip')}
                anchorClassName={styles.invalidIconAnchor}
              >
                <RiIcon
                  type="ToastDangerIcon"
                  color="danger600"
                  className={styles.invalidIcon}
                />
              </RiTooltip>
            )}
            <RiTooltip
              title={t('settings.cloud.table.name')}
              content={tooltipContent}
            >
              <>{name}</>
            </RiTooltip>
          </div>
        )
      },
    },
    {
      header: t('settings.cloud.table.created'),
      id: 'createdAt',
      accessorKey: 'createdAt',
      enableSorting: true,
      cell: ({
        row: {
          original: { createdAt },
        },
      }) => (
        <RiTooltip content={format(new Date(createdAt), 'HH:mm:ss d LLL yyyy')}>
          <>{format(new Date(createdAt), 'd MMM yyyy')}</>
        </RiTooltip>
      ),
    },
    {
      header: t('settings.cloud.table.lastUsed'),
      id: 'lastUsed',
      accessorKey: 'lastUsed',
      enableSorting: true,
      cell: ({
        row: {
          original: { lastUsed },
        },
      }) => (
        <>
          {lastUsed ? (
            <RiTooltip
              content={format(new Date(lastUsed), 'HH:mm:ss d LLL yyyy')}
            >
              <>{format(new Date(lastUsed), 'd MMM yyyy')}</>
            </RiTooltip>
          ) : (
            t('settings.cloud.table.never')
          )}
        </>
      ),
    },
    {
      header: '',
      id: 'actions',
      accessorKey: 'id',
      size: 48,
      sizeUnit: 'px',
      maxSize: 48,
      enableResizing: false,
      enableSorting: false,
      cell: ({
        row: {
          original: { id, name },
        },
      }) => (
        <Row align="center" justify="start" grow={false} gap="s">
          <CopyButton
            copy={name || ''}
            onCopy={handleCopy}
            aria-label={t('settings.cloud.table.copy.label')}
            successLabel=""
            tooltipConfig={{
              content: t('settings.cloud.table.copy.tooltip'),
            }}
            data-testid={`copy-api-key-${name}`}
          />
          <PopoverDelete
            header={
              <Trans
                i18nKey="settings.cloud.delete.header"
                values={{ name: formatLongName(name) }}
                components={{ lineBreak: <br /> }}
              />
            }
            text={
              <Trans
                i18nKey="settings.cloud.delete.text"
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
            }
            item={id}
            suffix=""
            deleting={deleting}
            closePopover={() => setDeleting('')}
            updateLoading={loading}
            showPopover={showPopover}
            testid={`remove-key-button-${name}`}
            handleDeleteItem={() => handleDeleteApiKey(id, name)}
            handleButtonClick={handleClickDeleteApiKey}
          />
        </Row>
      ),
    },
  ]

  if (isNull(items)) return null

  if (!items?.length) {
    return (
      <>
        <div className={styles.noKeysMessage} data-testid="no-api-keys-message">
          <Row align="center">
            <RiIcon
              className={styles.starsIcon}
              type="StarsIcon"
              color="attention300"
            />
            <Title size="XS">{t('settings.cloud.empty.title')}</Title>
          </Row>
          <Spacer size="s" />
          <Text size="s" className={styles.smallText} color="primary">
            {t('settings.cloud.empty.description')}
          </Text>
          <Spacer />
          <Row align="center" justify="end" grow={false} gap="s">
            <OAuthSsoHandlerDialog>
              {(socialCloudHandlerClick) => (
                <EmptyButton
                  size="small"
                  color="ghost"
                  onClick={(e: React.MouseEvent) =>
                    socialCloudHandlerClick(e, {
                      source: OAuthSocialSource.SettingsPage,
                      action: OAuthSocialAction.Import,
                    })
                  }
                  data-testid="autodiscover-btn"
                >
                  {t('settings.cloud.empty.autodiscover')}
                </EmptyButton>
              )}
            </OAuthSsoHandlerDialog>
            <OAuthSsoHandlerDialog>
              {(ssoCloudHandlerClick) => (
                <PrimaryButton
                  size="small"
                  onClick={(e: React.MouseEvent) =>
                    ssoCloudHandlerClick(e, {
                      source: OAuthSocialSource.SettingsPage,
                      action: OAuthSocialAction.Create,
                    })
                  }
                  data-testid="create-cloud-db-btn"
                >
                  {t('settings.cloud.empty.create')}
                </PrimaryButton>
              )}
            </OAuthSsoHandlerDialog>
          </Row>
        </div>
        <Spacer />
      </>
    )
  }

  return (
    <Table
      columns={columns}
      data={items}
      enableColumnResizing
      defaultSorting={[
        {
          id: 'createdAt',
          desc: true,
        },
      ]}
      data-testid="api-keys-table"
    />
  )
}

export default UserApiKeysTable
