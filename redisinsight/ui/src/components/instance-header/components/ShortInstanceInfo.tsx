import React, { useContext } from 'react'
import { capitalize } from 'lodash'

import cx from 'classnames'
import {
  CONNECTION_TYPE_DISPLAY,
  ConnectionType,
  DATABASE_LIST_MODULES_TEXT,
} from 'uiSrc/slices/interfaces'
import { getModule, Nullable, truncateText } from 'uiSrc/utils'

import { DEFAULT_MODULES_INFO } from 'uiSrc/constants/modules'
import { Theme } from 'uiSrc/constants'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { AllIconsType, RiIcon } from 'uiSrc/components/base/icons'
import { AdditionalRedisModule } from 'apiSrc/modules/database/models/additional.redis.module'
import styles from './styles.module.scss'

export interface Props {
  info: {
    name: string
    host: string
    port: string | number
    connectionType: ConnectionType
    version: string
    dbIndex: number
    user?: Nullable<string>
  }
  databases: number
  modules: AdditionalRedisModule[]
}
const ShortInstanceInfo = ({ info, databases, modules }: Props) => {
  const { name, host, port, connectionType, version, user } = info
  const { theme } = useContext(ThemeContext)

  const getIcon = (name: string) => {
    const icon: AllIconsType =
      DEFAULT_MODULES_INFO[name]?.[
        theme === Theme.Dark ? 'iconDark' : 'iconLight'
      ]
    if (icon) {
      return icon
    }

    return theme === Theme.Dark ? 'UnknownDarkIcon' : 'UnknownLightIcon'
  }

  return (
    <div data-testid="db-info-tooltip">
      <div className={styles.tooltipItem}>
        <b style={{ fontSize: 13 }}>{name}</b>
      </div>
      <div className={styles.tooltipItem}>
        <span>
          {host}:{port}
        </span>
      </div>
      {databases > 1 && (
        <Row className={styles.dbIndexInfo} align="center">
          <FlexItem style={{ marginRight: 16 }}>
            <RiIcon
              className={styles.messageInfoIcon}
              size="xxl"
              type="MessageInfoIcon"
            />
          </FlexItem>
          <FlexItem grow>
            <Text size="s">Logical Databases</Text>
            <Text color="subdued" size="xs">
              Select logical databases to work with in Browser, Workbench, and
              Database Analysis.
            </Text>
          </FlexItem>
        </Row>
      )}
      <Row className={styles.tooltipItem} align="center" justify="start">
        <FlexItem className={styles.rowTooltipItem}>
          <RiIcon type="ConnectionIcon" />
          <span className={styles.tooltipItemValue}>
            {connectionType
              ? CONNECTION_TYPE_DISPLAY[connectionType]
              : capitalize(connectionType)}
          </span>
        </FlexItem>
        <FlexItem className={styles.rowTooltipItem}>
          <RiIcon type="VersionIcon" />
          <span className={styles.tooltipItemValue}>{version}</span>
        </FlexItem>
        <FlexItem className={styles.rowTooltipItem}>
          <RiIcon type="UserIcon" />
          <span className={styles.tooltipItemValue}>{user || 'Default'}</span>
        </FlexItem>
      </Row>
      {!!modules?.length && (
        <div className={styles.modules}>
          <h4 className={styles.mi_fieldName}>Database Modules</h4>
          {modules?.map(({ name = '', semanticVersion = '', version = '' }) => (
            <div
              key={name}
              className={cx(styles.mi_moduleName)}
              data-testid={`module_${name}`}
            >
              <RiIcon type={getIcon(name)} className={styles.mi_icon} />
              <span>
                {truncateText(
                  getModule(name)?.name ||
                    DATABASE_LIST_MODULES_TEXT[name] ||
                    name,
                  50,
                )}
              </span>
              {!!(semanticVersion || version) && (
                <span className={styles.mi_version}>
                  v.
                  {semanticVersion || version}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ShortInstanceInfo
