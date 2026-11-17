import React from 'react'
import { capitalize } from 'lodash'

import { ConnectionType } from 'uiSrc/slices/interfaces'
import { Nullable } from 'uiSrc/utils'
import { SentinelMaster } from 'apiClient'
import { CopyButton } from 'uiSrc/components/copy-button'
import { useTranslation } from 'uiSrc/i18n'

import { DbInfoGroup } from '../DbInfo.styles'
import { ListGroupItemLabelValue } from '../DbInfo'
import { DbInfoLabelValue } from '../types'
import { StyledCopyContainer } from 'uiSrc/pages/home/components/form/sentinel/DbInfoSentinel.styles'

export interface Props {
  host?: string
  port?: string
  connectionType?: ConnectionType
  nameFromProvider?: Nullable<string>
  sentinelMaster?: SentinelMaster
}

const DbInfoSentinel = (props: Props) => {
  const { t } = useTranslation()
  const { connectionType, nameFromProvider, sentinelMaster, host, port } = props

  const dbInfo: DbInfoLabelValue[] = [
    {
      label: t('home.form.dbInfo.field.connectionType'),
      value: capitalize(connectionType),
      dataTestId: 'connection-type',
    },
    {
      label: t('home.form.dbInfoSentinel.field.primaryGroupName'),
      value: sentinelMaster?.name,
      dataTestId: 'primary-group-name',
      hide: !sentinelMaster?.name,
    },
    {
      label: t('home.form.dbInfo.field.nameFromProvider'),
      value: nameFromProvider,
      dataTestId: 'db-name-from-provider',
      hide: !nameFromProvider,
    },
    {
      label: t('home.form.dbInfoSentinel.field.hostAndPort'),
      value: `${host}:${port}`,
      dataTestId: 'host-and-port',
      additionalContent: (
        <StyledCopyContainer>
          <CopyButton
            copy={`${host}:${port}`}
            aria-label={t('home.form.dbInfoSentinel.ariaLabel.copyHostPort')}
          />
        </StyledCopyContainer>
      ),
      hide: !host || !port,
    },
  ]

  return (
    <DbInfoGroup flush maxWidth={false}>
      {dbInfo
        .filter((item) => !item.hide)
        .map((item) => (
          <ListGroupItemLabelValue
            key={item.dataTestId}
            label={item.label}
            value={item.value}
            dataTestId={item.dataTestId}
            additionalContent={item.additionalContent}
          />
        ))}
    </DbInfoGroup>
  )
}

export default DbInfoSentinel
