import React from 'react'

import { AllIconsType } from 'uiSrc/components/base/icons'

import { StyledIconButton, StyledColorText } from './DatabaseModuleItem.styles'

export interface DatabaseModuleItemProps {
  abbreviation?: string
  icon?: AllIconsType | null
  content?: string
  inCircle?: boolean
  onCopy?: (text: string) => void
}

export const DatabaseModuleItem = ({
  abbreviation = '',
  icon,
  content = '',
  inCircle,
  onCopy,
}: DatabaseModuleItemProps) => {
  const handleCopy = () => {
    onCopy?.(content)
  }

  return (
    <span>
      {icon ? (
        <StyledIconButton
          icon={icon}
          $inCircle={inCircle}
          onClick={handleCopy}
          data-testid={`${content}_module`}
          aria-labelledby={`${content}_module`}
        />
      ) : (
        <StyledColorText
          $inCircle={inCircle}
          onClick={handleCopy}
          data-testid={`${content}_module`}
          aria-labelledby={`${content}_module`}
        >
          {abbreviation}
        </StyledColorText>
      )}
    </span>
  )
}
