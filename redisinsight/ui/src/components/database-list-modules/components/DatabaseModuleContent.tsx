import React from 'react'
import { IDatabaseModule } from 'uiSrc/utils'

import { DatabaseModuleContentItem } from './DatabaseModuleContentItem'

export interface DatabaseModuleContentProps {
  modules: IDatabaseModule[]
}

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
