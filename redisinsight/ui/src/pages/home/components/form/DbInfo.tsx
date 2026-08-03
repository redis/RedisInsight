import React from 'react'
import { useAppSelector } from 'uiSrc/slices/hooks'
import { capitalize } from 'lodash'

import { Text } from 'uiSrc/components/base/text'
import { DatabaseListModules, RiTooltip } from 'uiSrc/components'
import { BuildType } from 'uiSrc/constants/env'
import { appInfoSelector } from 'uiSrc/slices/app/info'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import { Nullable } from 'uiSrc/utils'
import { Item as ListGroupItem } from 'uiSrc/components/base/layout/list'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'

import styles from '../styles.module.scss'
import { DbInfoGroup } from './DbInfo.styles'
import { Row } from 'uiSrc/components/base/layout/flex'
import { useTranslation } from 'uiSrc/i18n'
import { DbInfoLabelValue } from './types'
import { Endpoint, AdditionalRedisModule } from 'apiClient'

export interface Props {
  connectionType?: ConnectionType
  nameFromProvider?: Nullable<string>
  nodes: Nullable<Endpoint[]>
  host: string
  port: string
  db: Nullable<number>
  modules: AdditionalRedisModule[]
  isFromCloud: boolean
  isManaged?: boolean
}

export const ListGroupItemLabelValue = ({
  label,
  value,
  dataTestId,
  additionalContent,
}: {
  label: string
  value: string | React.ReactNode
  dataTestId?: string
  additionalContent?: React.ReactNode
}) => (
  <ListGroupItem
    label={
      <Row align="center" gap="m">
        <Text color="secondary">{label}</Text>
        <Text color="primary" data-testid={dataTestId}>
          {value}
        </Text>
        {additionalContent}
      </Row>
    }
  />
)

const AppendEndpoints = ({
  nodes,
  host,
  port,
}: {
  nodes: Endpoint[]
  host: string
  port: string
}) => {
  const { t } = useTranslation()

  return (
    <RiTooltip
      title={t('home.form.dbInfo.tooltip.hostPort')}
      position="left"
      anchorClassName={styles.anchorEndpoints}
      content={
        <ul className={styles.endpointsList}>
          {nodes?.map(({ host: eHost, port: ePort }) => (
            <li key={host + port}>
              <Text>
                {eHost}:{ePort};
              </Text>
            </li>
          ))}
        </ul>
      }
    >
      <RiIcon type="InfoIcon" style={{ cursor: 'pointer' }} />
    </RiTooltip>
  )
}

const DbInfo = (props: Props) => {
  const { t } = useTranslation()
  const {
    connectionType,
    nameFromProvider,
    nodes = null,
    host,
    port,
    db,
    modules,
    isFromCloud,
    isManaged = false,
  } = props

  // The endpoint is editable in the form for non-managed, non-cloud databases,
  // so it is hidden from this read-only summary in that case and shown here
  // otherwise (cloud/managed databases keep a read-only endpoint).
  const isEndpointEditable = !isManaged && !isFromCloud

  const { server } = useAppSelector(appInfoSelector)

  const dbInfo: DbInfoLabelValue[] = [
    {
      label: t('home.form.dbInfo.field.connectionType'),
      value: capitalize(connectionType),
      dataTestId: 'connection-type',
      hide: isFromCloud,
    },
    {
      label: t('home.form.dbInfo.field.nameFromProvider'),
      value: nameFromProvider,
      dataTestId: 'db-name-from-provider',
      hide: !nameFromProvider,
    },
    {
      label: t('home.form.dbInfo.field.host'),
      value: host,
      dataTestId: 'db-info-host',
      hide: isEndpointEditable && !nodes?.length,
      additionalContent: !!nodes?.length && (
        <AppendEndpoints nodes={nodes} host={host} port={port} />
      ),
    },
    {
      label: t('home.form.dbInfo.field.port'),
      value: port,
      dataTestId: 'db-info-port',
      hide: server?.buildType !== BuildType.RedisStack && isEndpointEditable,
    },
    {
      label: t('home.form.dbInfo.field.databaseIndex'),
      value: db?.toString(),
      dataTestId: 'db-index',
      hide: !db,
    },
    {
      label: t('home.form.dbInfo.field.capabilities'),
      value: <DatabaseListModules modules={modules} />,
      dataTestId: 'capabilities',
      hide: !modules?.length,
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

export default DbInfo
