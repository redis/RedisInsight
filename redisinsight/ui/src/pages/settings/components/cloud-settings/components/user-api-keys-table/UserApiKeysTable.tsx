import React, { useCallback, useState } from 'react'
import { format } from 'date-fns'
import { useDispatch } from 'react-redux'
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
import styles from './styles.module.scss'

export interface Props {
  items: Nullable<CloudCapiKey[]>
  loading: boolean
}

const UserApiKeysTable = ({ items, loading }: Props) => {
  const [deleting, setDeleting] = useState('')
  const dispatch = useDispatch()

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
      header: 'API Key Name',
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
                content="This API key is invalid. Remove it from Redis Cloud and create a new one instead."
                anchorClassName={styles.invalidIconAnchor}
              >
                <RiIcon
                  type="ToastDangerIcon"
                  color="danger600"
                  className={styles.invalidIcon}
                />
              </RiTooltip>
            )}
            <RiTooltip title="API Key Name" content={tooltipContent}>
              <>{name}</>
            </RiTooltip>
          </div>
        )
      },
    },
    {
      header: 'Created',
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
      header: 'Last used',
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
            'Never'
          )}
        </>
      ),
    },
    {
      header: '',
      id: 'actions',
      accessorKey: 'id',
      cell: ({
        row: {
          original: { id, name },
        },
      }) => (
        <Row align="center" justify="start" grow={false} gap="s">
          <CopyButton
            copy={name || ''}
            onCopy={handleCopy}
            aria-label="Copy API key"
            successLabel=""
            tooltipConfig={{
              content: 'Copy API Key Name',
            }}
            data-testid={`copy-api-key-${name}`}
          />
          <PopoverDelete
            header={
              <>
                {formatLongName(name)} <br /> will be removed from Redis
                Insight.
              </>
            }
            text={
              <>
                {'To delete this API key from Redis Cloud, '}
                <Link
                  target="_blank"
                  variant="inline"
                  color="text"
                  tabIndex={-1}
                  href="https://redis.io/redis-enterprise-cloud/overview/?utm_source=redisinsight&utm_medium=settings&utm_campaign=clear_keys"
                >
                  sign in to Redis Cloud
                </Link>
                {' and delete it manually.'}
              </>
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
            <Title size="XS">The ultimate Redis starting point</Title>
          </Row>
          <Spacer size="s" />
          <Text size="s" className={styles.smallText} color="primary">
            Cloud API keys will be created and stored when you connect to Redis
            Cloud to create a free Redis Cloud database or autodiscover your
            Cloud database.
          </Text>
          <Spacer />
          <div className={styles.actions}>
            <OAuthSsoHandlerDialog>
              {(socialCloudHandlerClick) => (
                <EmptyButton
                  size="small"
                  color="ghost"
                  className={styles.autodiscoverBtn}
                  onClick={(e: React.MouseEvent) =>
                    socialCloudHandlerClick(e, {
                      source: OAuthSocialSource.SettingsPage,
                      action: OAuthSocialAction.Import,
                    })
                  }
                  data-testid="autodiscover-btn"
                >
                  Autodiscover
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
                  Create Redis Cloud database
                </PrimaryButton>
              )}
            </OAuthSsoHandlerDialog>
          </div>
        </div>
        <Spacer />
      </>
    )
  }

  return (
    <Table
      columns={columns}
      data={items}
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
