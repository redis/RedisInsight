import React from 'react'
import { capitalize } from 'lodash'

import { ConnectionType } from 'uiSrc/slices/interfaces'
import { Nullable } from 'uiSrc/utils'
import { RiColorText, RiText } from 'uiSrc/components/base/text'
import { RiListGroup, RiListItem } from 'uiSrc/components/base/layout'
import { SentinelMaster } from 'apiSrc/modules/redis-sentinel/models/sentinel-master'
import SentinelHostPort from './SentinelHostPort'

import styles from '../../styles.module.scss'

export interface Props {
  host?: string
  port?: string
  connectionType?: ConnectionType
  nameFromProvider?: Nullable<string>
  sentinelMaster?: SentinelMaster
}

const DbInfoSentinel = (props: Props) => {
  const { connectionType, nameFromProvider, sentinelMaster, host, port } = props
  return (
    <RiListGroup className={styles.dbInfoGroup} flush>
      <RiListItem
        label={
          <RiText color="subdued" size="s">
            Connection Type:
            <RiColorText color="default" className={styles.dbInfoListValue}>
              {capitalize(connectionType)}
            </RiColorText>
          </RiText>
        }
      />

      {sentinelMaster?.name && (
        <RiListItem
          label={
            <RiText color="subdued" size="s">
              Primary Group Name:
              <RiColorText color="default" className={styles.dbInfoListValue}>
                {sentinelMaster?.name}
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

      {host && port && <SentinelHostPort host={host} port={port} />}
    </RiListGroup>
  )
}

export default DbInfoSentinel
