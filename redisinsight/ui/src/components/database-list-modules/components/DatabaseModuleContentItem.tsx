import React from 'react'
import { AllIconsType, RiIcon } from 'uiSrc/components/base/icons'

import {
  StyledAbbreviationText,
  StyledContentItemRow,
  StyledContentText,
} from './DatabaseModuleContentItem.styles'

export interface DatabaseModuleContentItemProps {
  icon?: AllIconsType
  content?: string
  abbreviation?: string
}

export const DatabaseModuleContentItem = ({
  icon,
  content,
  abbreviation = '',
}: DatabaseModuleContentItemProps) => {
  const hasIcon = !!icon
  const hasContent = !!content
  const hasAbbreviation = !!abbreviation

  return (
    <StyledContentItemRow align="center" gap="m">
      {hasIcon && <RiIcon type={icon} size="M" />}
      {!hasIcon && hasAbbreviation && (
        <StyledAbbreviationText>{abbreviation}</StyledAbbreviationText>
      )}
      {hasContent && <StyledContentText>{content}</StyledContentText>}
    </StyledContentItemRow>
  )
}
