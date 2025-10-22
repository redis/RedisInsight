import React from 'react'
import { useSelector } from 'react-redux'
import { capitalize } from 'lodash'
import styled from 'styled-components'

import { Text } from 'uiSrc/components/base/text'
import { DatabaseListModules, RiTooltip } from 'uiSrc/components'
import { BuildType } from 'uiSrc/constants/env'
import { appInfoSelector } from 'uiSrc/slices/app/info'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import { Nullable } from 'uiSrc/utils'
import {
  Group as ListGroup,
  Item as ListGroupItem,
} from 'uiSrc/components/base/layout/list'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { Row } from 'uiSrc/components/base/layout/flex'
import { Theme } from 'uiSrc/components/base/theme/types'

import { Endpoint } from 'apiSrc/common/models'
import { AdditionalRedisModule } from 'apiSrc/modules/database/models/additional.redis.module'

import styles from '../styles.module.scss'

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

const ListText = ({
  label,
  value,
  testId,
}: {
  label: string
  value: string | number
  testId: string
}) => {
  return (
    <Row gap="m" justify="start" align="center">
      <Text component="span" color="primary" size="s">
        {label}:
      </Text>
      <Text data-testid={testId} color="primary" component="span" size="s">
        {value}
      </Text>
    </Row>
  )
}

const DbInfoGroup = styled(ListGroup)`
  max-width: 100%;
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral300};
  border: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral600};
  padding: ${({ theme }: { theme: Theme }) => theme.core.space.space100}
    ${({ theme }: { theme: Theme }) => theme.core.space.space200};
  border-radius: ${({ theme }: { theme: Theme }) => theme.core.space.space050};

  .RI-list-group-item-text {
    pointer-events: none;
    word-break: break-word;
    white-space: initial;
  }

  .RI-list-group-item {
    padding: ${({ theme }: { theme: Theme }) => theme.core.space.space050} 0;
    margin-top: 0;
  }
`
const AppendEndpoints = ({
  nodes,
  host,
  port,
}: {
  nodes: Props['nodes']
  host: Props['host']
  port: Props['port']
}) => {
  if (!nodes?.length) {
    return null
  }
  return (
    <RiTooltip
      title="Host:port"
      position="left"
      anchorClassName={styles.anchorEndpoints}
      content={
        <ul className={styles.endpointsList}>
          {nodes?.map(({ host: eHost, port: ePort }) => (
            <li key={host + port}>
              <Text component="span" size="s">
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

  return (
    <DbInfoGroup flush maxWidth={false}>
      {!isFromCloud && (
        <ListGroupItem
          label={
            <ListText
              label="Connection Type"
              value={capitalize(connectionType)}
              testId="connection-type"
            />
          }
        />
      )}

      {nameFromProvider && (
        <ListGroupItem
          label={
            <ListText
              label="Database Name from Provider"
              value={nameFromProvider}
              testId="db-name-from-provider"
            />
          }
        />
      )}
      <ListGroupItem
        label={
          <>
            <ListText label="Host" value={host} testId="db-info-host" />
            <AppendEndpoints nodes={nodes} host={host} port={port} />
          </>
        }
      />
      {(server?.buildType === BuildType.RedisStack || isFromCloud) && (
        <ListGroupItem
          label={<ListText label="Port" value={port} testId="db-info-port" />}
        />
      )}

      {!!db && (
        <ListGroupItem
          label={
            <ListText label="Database Index" value={db} testId="db-info-db" />
          }
        />
      )}

      {!!modules?.length && (
        <ListGroupItem
          label={
            <Text color="primary" component="span" size="s">
              Capabilities:
              <DatabaseListModules modules={modules} />
            </Text>
          }
        />
      )}
    </DbInfoGroup>
  )
}

export default DbInfo
