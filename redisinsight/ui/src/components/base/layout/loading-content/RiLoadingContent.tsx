import React from 'react'
import classNames from 'classnames'

import {
  StyledLoadingContent,
  LoadingContentProps,
  SingleLine,
  SingleLineBackground,
} from './loading-content.styles'

export const RiLoadingContent = ({
  className,
  lines = 3,
  ...rest
}: LoadingContentProps) => {
  const classes = classNames('RI-loading-content', className)
  const lineElements = []

  for (let i = 0; i < lines; i++) {
    lineElements.push(
      <SingleLine key={i}>
        <SingleLineBackground />
      </SingleLine>,
    )
  }

  return (
    <StyledLoadingContent className={classes} {...rest}>
      {lineElements}
    </StyledLoadingContent>
  )
}
