import React, { useMemo } from 'react'

import {
  IDatabaseModule,
  sortModules,
  transformModule,
} from 'uiSrc/utils/modules'
import { RiTooltip } from 'uiSrc/components'

import { DatabaseModulesList, DatabaseModuleContent } from './components'
import { DatabaseListModulesProps } from './DatabaseListModules.types'
import * as S from './DatabaseListModules.styles'

export type { DatabaseListModulesProps }

export const DatabaseListModules = React.memo(
  (props: DatabaseListModulesProps) => {
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
      <S.StyledContainer
        $unstyled={withoutStyles}
        $highlight={highlight}
        $inCircle={inCircle}
      >
        {inCircle ? (
          <DatabaseModulesList
            modules={newModules}
            contentItems={contentItems}
            inCircle={inCircle}
            anchorClassName={S.ANCHOR_MODULE_TOOLTIP_CLASS}
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
      </S.StyledContainer>
    )
  },
)
