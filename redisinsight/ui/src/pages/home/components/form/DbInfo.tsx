import React from 'react'
import { useSelector } from 'react-redux'
import { capitalize } from 'lodash'

import { Text } from 'uiSrc/components/base/text'
import { DatabaseListModules, RiTooltip } from 'uiSrc/components'
import { BuildType } from 'uiSrc/constants/env'
import { appInfoSelector } from 'uiSrc/slices/app/info'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import { Nullable } from 'uiSrc/utils'
import { Item as ListGroupItem } from 'uiSrc/components/base/layout/list'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { Endpoint } from 'apiSrc/common/models'
import { AdditionalRedisModule } from 'apiSrc/modules/database/models/additional.redis.module'

import styles from '../styles.module.scss'
import { DbInfoGroup } from './DbInfo.styles'
import { Row } from 'uiSrc/components/base/layout/flex'

export interface Props {
  connectionType?: ConnectionType
  nameFromProvider?: Nullable<string>
  nodes: Nullable<Endpoint[]>
  host: string
  port: string
  db: Nullable<number>
  modules: AdditionalRedisModule[]
  isFromCloud: boolean
}

const ListGroupItemLabelValue = ({
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
      <>
        <Row align="center" gap="m">
          <Text color="ghost">{label}</Text>
          <Text color="primary" data-testid={dataTestId}>
            {value}
          </Text>
          {additionalContent}
        </Row>
      </>
    }
  />
)

const DbInfo = (props: Props) => {
  const {
    connectionType,
    nameFromProvider,
    nodes = null,
    host,
    port,
    db,
    modules,
    isFromCloud,
  } = props

  const { server } = useSelector(appInfoSelector)

  const AppendEndpoints = () => (
    <RiTooltip
      title="Host:port"
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
      <RiIcon
        type="InfoIcon"
        style={{ cursor: "pointer" }}
      />
    </RiTooltip>
  )

  return (
    <DbInfoGroup flush maxWidth={false}>
      {!isFromCloud && (
        <ListGroupItemLabelValue
          label="Connection Type:"
          value={capitalize(connectionType)}
          dataTestId="connection-type"
        />
      )}

      {nameFromProvider && (
        <ListGroupItemLabelValue
          label="Database Name from Provider:"
          value={nameFromProvider}
          dataTestId="db-name-from-provider"
        />
      )}

      <ListGroupItemLabelValue
        label="Host:"
        value={host}
        dataTestId="db-info-host"
        additionalContent={!!nodes?.length && <AppendEndpoints />}
      />

      {(server?.buildType === BuildType.RedisStack || isFromCloud) && (
        <ListGroupItemLabelValue
          label="Port:"
          value={port}
          dataTestId="db-info-port"
        />
      )}

      {!!db && (
        <ListGroupItemLabelValue
          label="Database Index:"
          value={db.toString()}
          dataTestId="db-index"
        />
      )}

      {!!modules?.length && (
        <ListGroupItemLabelValue
          label="Capabilities:"
          value={<DatabaseListModules modules={modules} />}
          dataTestId="capabilities"
        />
      )}
    </DbInfoGroup>
  )
}

export default DbInfo
