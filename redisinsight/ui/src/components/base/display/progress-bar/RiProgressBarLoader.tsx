import React from 'react'
import {
  LoaderBar,
  ProgressBarLoaderProps,
  LoaderContainer,
} from './progress-bar-loader.styles'

export const RiProgressBarLoader = ({
  className,
  style,
  color,
  ...rest
}: ProgressBarLoaderProps) => (
  <LoaderContainer className={className} style={style} {...rest}>
    <LoaderBar $color={color} />
  </LoaderContainer>
)
