/* eslint-disable sonarjs/no-nested-template-literals */
import React, { useContext } from 'react'
import cx from 'classnames'

import { Theme } from 'uiSrc/constants'
import { getModule, truncateText } from 'uiSrc/utils'
import { IDatabaseModule, sortModules } from 'uiSrc/utils/modules'
import { ThemeContext } from 'uiSrc/contexts/themeContext'

import { DEFAULT_MODULES_INFO, ModuleInfo } from 'uiSrc/constants/modules'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { ColorText } from 'uiSrc/components/base/text'
import { RiTooltip } from 'uiSrc/components'
import { RiIcon } from 'uiSrc/components/base/icons'
import { Row } from 'uiSrc/components/base/layout/flex'
import { RedisDefaultModules } from 'uiSrc/slices/interfaces'
import { AdditionalRedisModule } from 'apiSrc/modules/database/models/additional.redis.module'

import styles from './styles.module.scss'

export interface Props {
  content?: JSX.Element
  modules: AdditionalRedisModule[]
  inCircle?: boolean
  highlight?: boolean
  maxViewModules?: number
  tooltipTitle?: React.ReactNode
  withoutStyles?: boolean
}

const DatabaseListModules = React.memo((props: Props) => {
  const {
    content,
    modules,
    inCircle,
    highlight,
    tooltipTitle,
    maxViewModules,
    withoutStyles,
  } = props
  const { theme } = useContext(ThemeContext)

  const mainContent: IDatabaseModule[] = []

  const handleCopy = (text = '') => {
    navigator?.clipboard?.writeText(text)
  }

  const newModules: IDatabaseModule[] = sortModules(
    modules?.map(({ name: propName, semanticVersion = '', version = '' }) => {
      const isValidModuleKey = Object.values(RedisDefaultModules).includes(propName as RedisDefaultModules)
      
      const module: ModuleInfo | undefined = isValidModuleKey 
        ? DEFAULT_MODULES_INFO[propName as RedisDefaultModules]
        : undefined
      const moduleName = module?.text || propName

      const { abbreviation = '', name = moduleName } = getModule(moduleName)

      const moduleAlias = truncateText(name, 50)
      // eslint-disable-next-line sonarjs/no-nested-template-literals
      let icon = module?.[theme === Theme.Dark ? 'iconDark' : 'iconLight']
      const content = `${moduleAlias}${semanticVersion || version ? ` v. ${semanticVersion || version}` : ''}`

      if (!icon && !abbreviation) {
        icon = theme === Theme.Dark ? 'UnknownDarkIcon' : 'UnknownLightIcon'
      }

      mainContent.push({ icon, content, abbreviation, moduleName })

      return {
        moduleName,
        icon,
        abbreviation,
        content,
      }
    }),
  )
  // set count of hidden modules
  if (maxViewModules && newModules.length > maxViewModules + 1) {
    newModules.length = maxViewModules
    newModules.push({
      icon: null,
      content: '',
      moduleName: '',
      abbreviation: `+${modules.length - maxViewModules}`,
    })
  }

  const Content = sortModules(mainContent).map(
    ({ icon, content, abbreviation = '' }) => {
      const hasIcon = !!icon
      const hasContent = !!content
      const hasAbbreviation = !!abbreviation
      return (
        <Row
          align="center"
          gap="m"
          className={styles.tooltipItem}
          key={content || abbreviation}
        >
          {hasIcon && <RiIcon type={icon} />}
          {!hasIcon && hasAbbreviation && (
            <ColorText
              className={cx(styles.icon, styles.abbr)}
              style={{ marginRight: 10 }}
            >
              {abbreviation}
            </ColorText>
          )}
          {hasContent && (
            <ColorText className={cx(styles.tooltipItemText)}>
              {content}
            </ColorText>
          )}
        </Row>
      )
    },
  )

  const Module = (
    moduleName: string = '',
    abbreviation: string = '',
    icon: string,
    content: string = '',
  ) => (
    <span key={moduleName || abbreviation || content}>
      {icon ? (
        <IconButton
          icon={icon}
          className={cx(styles.icon, { [styles.circle]: inCircle })}
          onClick={() => handleCopy(content)}
          data-testid={`${content}_module`}
          aria-labelledby={`${content}_module`}
        />
      ) : (
        <ColorText
          className={cx(styles.icon, styles.abbr, {
            [styles.circle]: inCircle,
          })}
          onClick={() => handleCopy(content)}
          data-testid={`${content}_module`}
          aria-labelledby={`${content}_module`}
        >
          {abbreviation}
        </ColorText>
      )}
    </span>
  )

  const Modules = () =>
    newModules.map(({ icon, content, abbreviation, moduleName }, i) =>
      !inCircle ? (
        Module(moduleName, abbreviation, icon, content)
      ) : (
        <RiTooltip
          position="bottom"
          content={Content[i]}
          anchorClassName={styles.anchorModuleTooltip}
          key={moduleName}
        >
          <>{Module(moduleName, abbreviation, icon, content)}</>
        </RiTooltip>
      ),
    )

  return (
    <div
      className={cx({
        [styles.container]: !withoutStyles,
        [styles.highlight]: highlight,
        [styles.containerCircle]: inCircle,
      })}
    >
      {inCircle ? (
        Modules()
      ) : (
        <RiTooltip
          position="bottom"
          title={tooltipTitle ?? undefined}
          content={Content}
          data-testid="modules-tooltip"
        >
          <>{content ?? Modules()}</>
        </RiTooltip>
      )}
    </div>
  )
})

export default DatabaseListModules
