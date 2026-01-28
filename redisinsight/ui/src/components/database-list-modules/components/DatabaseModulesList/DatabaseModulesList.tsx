import React from 'react'

import { RiTooltip } from 'uiSrc/components'
import { handleCopy } from 'uiSrc/utils'

import { DatabaseModuleContentItem } from 'uiSrc/components/database-list-modules/components'
import { DatabaseModuleItem } from '../DatabaseModuleItem/DatabaseModuleItem'
import { DatabaseModulesListProps } from './DatabaseModulesList.types'

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
