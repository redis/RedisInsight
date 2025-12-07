import React from 'react'
import {
  LoaderBar,
  ProgressBarLoaderProps,
  LoaderContainer,
} from './progress-bar-loader.styles'

const ProgressBarLoader = ({
  className,
  style,
  color,
  ...rest
}: ProgressBarLoaderProps) => (
  <LoaderContainer className={className} style={style} {...rest}>
    <LoaderBar $color={color} />
  </LoaderContainer>
)

export default ProgressBarLoader
