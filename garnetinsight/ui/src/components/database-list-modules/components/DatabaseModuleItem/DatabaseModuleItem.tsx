import React from "react"

import { DatabaseModuleItemProps } from "./DatabaseModuleItem.types"
import { StyledIconButton, StyledColorText } from "./DatabaseModuleItem.styles"

export const DatabaseModuleItem = ({
  abbreviation = "",
  icon,
  content = "",
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

