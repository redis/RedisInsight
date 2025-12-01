import React, { useMemo } from 'react'

import {
  IDatabaseModule,
  sortModules,
  transformModule,
} from 'uiSrc/utils/modules'

import { RiTooltip } from 'uiSrc/components'
import { AdditionalRedisModule } from 'apiSrc/modules/database/models/additional.redis.module'

import { DatabaseModulesList } from './components/DatabaseModulesList'
import { StyledContainer } from './DatabaseListModules.styles'
import styles from './styles.module.scss'
import { DatabaseModuleContent } from 'uiSrc/components/database-list-modules/components/DatabaseModuleContent'

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

  const { newModules, contentItems } = useMemo(() => {
    const mainModules: IDatabaseModule[] = []

    const newModules: IDatabaseModule[] = sortModules(
      modules?.map((module) => {
        const transformed = transformModule(module)
        mainModules.push({
          icon: transformed.icon,
          content: transformed.content,
          abbreviation: transformed.abbreviation,
          moduleName: transformed.moduleName,
        })
        return transformed
      }),
    )
    // set count of hidden modules if maxViewModules is provided
    let finalModules = newModules
    if (maxViewModules && newModules.length > maxViewModules + 1) {
      const hiddenCount = newModules.length - maxViewModules
      finalModules = [
        ...newModules.slice(0, maxViewModules),
        {
          icon: null,
          content: '',
          moduleName: '',
          abbreviation: `+${hiddenCount}`,
        },
      ]
    }
    const contentItems = sortModules(mainModules)

    return { newModules: finalModules, contentItems }
  }, [modules, maxViewModules])

  return (
    <StyledContainer
      $unstyled={withoutStyles}
      $highlight={highlight}
      $inCircle={inCircle}
    >
      {inCircle ? (
        <DatabaseModulesList
          modules={newModules}
          contentItems={contentItems}
          inCircle={inCircle}
          anchorClassName={styles.anchorModuleTooltip}
        />
      ) : (
        <RiTooltip
          position="bottom"
          title={tooltipTitle ?? undefined}
          content={<DatabaseModuleContent modules={contentItems} />}
          data-testid="modules-tooltip"
        >
          <>
            {content ?? (
              <DatabaseModulesList
                modules={newModules}
                contentItems={contentItems}
                inCircle={inCircle}
              />
            )}
          </>
        </RiTooltip>
      )}
    </StyledContainer>
  )
})

export default DatabaseListModules
