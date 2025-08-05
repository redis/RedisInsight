import React from 'react'
import { useSelector } from 'react-redux'
import { capitalize } from 'lodash'
import cx from 'classnames'

import { RiColorText, RiText } from 'uiSrc/components/base/text'
import { DatabaseListModules, RiTooltip } from 'uiSrc/components'
import { BuildType } from 'uiSrc/constants/env'
import { appInfoSelector } from 'uiSrc/slices/app/info'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import { Nullable } from 'uiSrc/utils'
import { RiListGroup, RiListItem } from 'uiSrc/components/base/layout'
import { RiIcon } from 'uiSrc/components/base/icons'
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
              <RiText>
                {eHost}:{ePort};
              </RiText>
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
    <RiListGroup className={styles.dbInfoGroup} flush>
      {!isFromCloud && (
        <RiListItem
          label={
            <RiText color="subdued" size="s">
              Connection Type:
              <RiColorText
                color="default"
                className={styles.dbInfoListValue}
                data-testid="connection-type"
              >
                {capitalize(connectionType)}
              </RiColorText>
            </RiText>
          }
        />
      )}

      {nameFromProvider && (
        <RiListItem
          label={
            <RiText color="subdued" size="s">
              Database Name from Provider:
              <RiColorText color="default" className={styles.dbInfoListValue}>
                {nameFromProvider}
              </RiColorText>
            </RiText>
          }
        />
      )}
      <RiListItem
        label={
          <>
            {!!nodes?.length && <AppendEndpoints />}
            <RiText color="subdued" size="s">
              Host:
              <RiColorText
                color="default"
                className={styles.dbInfoListValue}
                data-testid="db-info-host"
              >
                {host}
              </RiColorText>
            </RiText>
          </>
        }
      />
      {(server?.buildType === BuildType.RedisStack || isFromCloud) && (
        <RiListItem
          label={
            <RiText color="subdued" size="s">
              Port:
              <RiColorText
                color="default"
                className={styles.dbInfoListValue}
                data-testid="db-info-port"
              >
                {port}
              </RiColorText>
            </RiText>
          }
        />
      )}

      {!!db && (
        <RiListItem
          label={
            <RiText color="subdued" size="s">
              Database Index:
              <RiColorText color="default" className={styles.dbInfoListValue}>
                {db}
              </RiColorText>
            </RiText>
          }
        />
      )}

      {!!modules?.length && (
        <RiListItem
          className={styles.dbInfoModulesLabel}
          label={
            <RiText color="subdued" size="s">
              Capabilities:
              <RiColorText
                color="default"
                className={cx(styles.dbInfoListValue, styles.dbInfoModules)}
              >
                <DatabaseListModules modules={modules} />
              </RiColorText>
            </RiText>
          }
        />
      )}
    </RiListGroup>
  )
}

export default DbInfo
