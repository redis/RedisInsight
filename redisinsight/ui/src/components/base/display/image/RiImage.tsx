import React from 'react'
import { RiImageProps, StyledImage } from './image.styles'

export const RiImage = ({ $size, src, alt, ...rest }: RiImageProps) => (
  <StyledImage src={src} alt={alt} $size={$size} {...rest} />
)
