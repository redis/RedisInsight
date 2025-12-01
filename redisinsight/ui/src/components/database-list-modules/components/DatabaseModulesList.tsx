import React from 'react'

import { RiTooltip } from 'uiSrc/components'
import { IDatabaseModule } from 'uiSrc/utils/modules'

import { DatabaseModuleItem } from './DatabaseModuleItem'
import { handleCopy } from 'uiSrc/utils'
import { DatabaseModuleContentItem } from 'uiSrc/components/database-list-modules/components/DatabaseModuleContentItem'

export interface DatabaseModulesListProps {
  modules: IDatabaseModule[]
  contentItems: IDatabaseModule[]
  inCircle?: boolean
  anchorClassName?: string
}

export const DatabaseModulesList = ({
  modules,
  contentItems,
  inCircle,
  anchorClassName,
}: DatabaseModulesListProps) => {
  return (
    <>
      {modules.map(({ icon, content, abbreviation, moduleName }, i) => {
        const contentItem = contentItems[i]
        return !inCircle ? (
          <DatabaseModuleItem
            key={moduleName || abbreviation || content}
            abbreviation={abbreviation}
            icon={icon}
            content={content}
            inCircle={inCircle}
            onCopy={handleCopy}
          />
        ) : (
          <RiTooltip
            position="bottom"
            content={
              <DatabaseModuleContentItem
                key={contentItem.content || contentItem.abbreviation}
                {...contentItem}
              />
            }
            anchorClassName={anchorClassName}
            key={moduleName}
          >
            <DatabaseModuleItem
              abbreviation={abbreviation}
              icon={icon}
              content={content}
              inCircle={inCircle}
              onCopy={handleCopy}
            />
          </RiTooltip>
        )
      })}
    </>
  )
}
