import React from 'react'
import { useSelector } from 'react-redux'
import { capitalize } from 'lodash'
import cx from 'classnames'

import { ColorText, Text } from 'uiSrc/components/base/text'
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
        color="informative400"
        title=""
        style={{ cursor: 'pointer' }}
      />
    </RiTooltip>
  )

  return (
    <ListGroup className={styles.dbInfoGroup} flush>
      {!isFromCloud && (
        <ListGroupItem
          label={
            <Text color="default" size="s">
              Connection Type:
              <ColorText
                color="default"
                className={styles.dbInfoListValue}
                data-testid="connection-type"
              >
                {capitalize(connectionType)}
              </ColorText>
            </Text>
          }
        />
      )}

      {nameFromProvider && (
        <ListGroupItem
          label={
            <Text color="default" size="s">
              Database Name from Provider:
              <ColorText color="default" className={styles.dbInfoListValue}>
                {nameFromProvider}
              </ColorText>
            </Text>
          }
        />
      )}
      <ListGroupItem
        label={
          <>
            {!!nodes?.length && <AppendEndpoints />}
            <Text color="default" size="s">
              Host:
              <ColorText
                color="default"
                className={styles.dbInfoListValue}
                data-testid="db-info-host"
              >
                {host}
              </ColorText>
            </Text>
          </>
        }
      />
      {(server?.buildType === BuildType.RedisStack || isFromCloud) && (
        <ListGroupItem
          label={
            <Text color="default" size="s">
              Port:
              <ColorText
                color="default"
                className={styles.dbInfoListValue}
                data-testid="db-info-port"
              >
                {port}
              </ColorText>
            </Text>
          }
        />
      )}

      {!!db && (
        <ListGroupItem
          label={
            <Text color="default" size="s">
              Database Index:
              <ColorText color="default" className={styles.dbInfoListValue}>
                {db}
              </ColorText>
            </Text>
          }
        />
      )}

      {!!modules?.length && (
        <ListGroupItem
          label={
            <Text color="default" size="s">
              Capabilities:
              <DatabaseListModules modules={modules} />
            </Text>
          }
        />
      )}
    </ListGroup>
  )
}

export default DbInfo
