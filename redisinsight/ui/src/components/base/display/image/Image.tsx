import React from 'react'
import { RiImageProps, StyledImage } from './image.styles'

const RiImage = ({ size, src, alt }: RiImageProps) => (
  <StyledImage src={src} alt={alt} size={size} />
)

export default RiImage
