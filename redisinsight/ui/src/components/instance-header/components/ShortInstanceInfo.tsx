import React, { useContext } from 'react'
import { capitalize } from 'lodash'

import {
  CONNECTION_TYPE_DISPLAY,
  ConnectionType,
  DATABASE_LIST_MODULES_TEXT,
  RedisDefaultModules,
} from 'uiSrc/slices/interfaces'
import { getModule, Nullable, truncateText } from 'uiSrc/utils'

import { DEFAULT_MODULES_INFO } from 'uiSrc/constants/modules'
import { Theme } from 'uiSrc/constants'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { AllIconsType, RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { AdditionalRedisModule } from 'apiSrc/modules/database/models/additional.redis.module'
import { RiImage } from 'uiSrc/components/base/display'
import MessageInfoSvg from 'uiSrc/assets/img/icons/help_illus.svg'
import { DbIndexInfoWrapper, SeparatorLine } from './ShortInstanceInfo.styles'

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
      DEFAULT_MODULES_INFO[name as RedisDefaultModules]?.[
        theme === Theme.Dark ? 'iconDark' : 'iconLight'
      ]
    if (icon) {
      return icon
    }

    return theme === Theme.Dark ? 'UnknownDarkIcon' : 'UnknownLightIcon'
  }

  return (
    <Col gap="l" data-testid="db-info-tooltip">
      <Col gap="m">
        <Col gap="m">
          <Text color="primary" size="L" component="div" variant="semiBold">
            {name}
          </Text>
          <Text color="primary" size="s">
            {host}:{port}
          </Text>
        </Col>
        {databases > 1 && (
          <DbIndexInfoWrapper align="center" gap="l">
            <Col>
              <RiImage src={MessageInfoSvg} alt="Database Info" $size="xs" />
            </Col>
            <Col gap="xs">
              <Text size="m">Logical databases</Text>
              <Text color="secondary" size="s">
                Select logical databases to work with in Browser, Workbench, and
                Database Analysis.
              </Text>
            </Col>
          </DbIndexInfoWrapper>
        )}
        <Row align="center" gap="l">
          <Row align="center" grow={false}>
            <RiIcon type="ConnectionIcon" size="M" />
            <span>
              {connectionType
                ? CONNECTION_TYPE_DISPLAY[connectionType]
                : capitalize(connectionType)}
            </span>
          </Row>
          <Row align="center" grow={false}>
            <RiIcon type="VersionIcon" size="M" />
            <span>{version}</span>
          </Row>
          <Row align="center" grow={false}>
            <RiIcon type="UserIcon" size="S" />
            <span>{user || 'Default'}</span>
          </Row>
        </Row>
      </Col>
      {!!modules?.length && (
        <>
          <SeparatorLine />
          <Text color="primary" size="L" component="div" variant="semiBold">
            Database modules
          </Text>
          <Col gap="s">
            {modules?.map(
              ({ name = '', semanticVersion = '', version = '' }) => (
                <Row
                  gap="s"
                  align="center"
                  key={name}
                  data-testid={`module_${name}`}
                >
                  <RiIcon type={getIcon(name)} size="M" />
                  <Text size="S" color="secondary">
                    {truncateText(
                      getModule(name)?.name ||
                        DATABASE_LIST_MODULES_TEXT[
                          name as RedisDefaultModules
                        ] ||
                        name,
                      50,
                    )}{' '}
                    v.
                    {semanticVersion || version}
                  </Text>
                </Row>
              ),
            )}
          </Col>
        </>
      )}
    </Col>
  )
}

export default ShortInstanceInfo
