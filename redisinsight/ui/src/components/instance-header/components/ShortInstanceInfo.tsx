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
import { FlexGroup, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { AllIconsType, RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { AdditionalRedisModule } from 'apiSrc/modules/database/models/additional.redis.module'
import { Spacer } from 'uiSrc/components/base/layout'
import { RiImage } from 'uiSrc/components/base/display'
import MessageInfoSvg from 'uiSrc/assets/img/icons/help_illus.svg'
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
      <Text color="primary" size="m" component="div" variant="semiBold">
        {name}
      </Text>
      <Spacer size="xs" />
      <Text color="primary" size="s">
        {host}:{port}
      </Text>
      {databases > 1 && (
        <Row className={styles.dbIndexInfo} align="center" gap="l">
          <FlexItem>
            <RiImage src={MessageInfoSvg} alt="Database Info" $size="xs" />
          </FlexItem>
          <FlexItem>
            <Text size="m">Logical Databases</Text>
            <Spacer size="xs" />
            <Text color="primary" size="s">
              Select logical databases to work with in Browser, Workbench, and
              Database Analysis.
            </Text>
          </FlexItem>
        </Row>
      )}
      <FlexGroup align="center">
        <Row align="center">
          <RiIcon type="ConnectionIcon" />
          <span>
            {connectionType
              ? CONNECTION_TYPE_DISPLAY[connectionType]
              : capitalize(connectionType)}
          </span>
        </Row>
        <Row align="center">
          <RiIcon type="VersionIcon" />
          <span>{version}</span>
        </Row>
        <Row align="center">
          <RiIcon type="UserIcon" />
          <span>{user || 'Default'}</span>
        </Row>
      </FlexGroup>
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
