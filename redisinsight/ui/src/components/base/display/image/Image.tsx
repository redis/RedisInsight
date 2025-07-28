import React from 'react'
import { RiImageProps, StyledImage } from './image.styles'

const RiImage = ({ size, src, alt, loading, ...rest }: RiImageProps) => (
  <StyledImage src={src} alt={alt} size={size} {...rest} />
)

export default RiImage
