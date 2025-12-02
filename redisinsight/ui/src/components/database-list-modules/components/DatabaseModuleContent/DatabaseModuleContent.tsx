import React from 'react'

import { DatabaseModuleContentItem } from 'uiSrc/components/database-list-modules/components'
import { DatabaseModuleContentProps } from './DatabaseModuleContent.types'

export const DatabaseModuleContent = ({
  modules,
}: DatabaseModuleContentProps) => {
  return (
    <>
      {modules.map(({ icon, content, abbreviation }) => (
        <DatabaseModuleContentItem
          key={content || abbreviation}
          icon={icon}
          content={content}
          abbreviation={abbreviation}
        />
      ))}
    </>
  )
}
