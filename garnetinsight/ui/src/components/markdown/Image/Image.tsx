import React from 'react'
import { IS_ABSOLUTE_PATH } from 'uiSrc/constants/regex'
import { RESOURCES_BASE_URL } from 'uiSrc/services/resourcesService'

export interface Props {
  src: string
}
const Image = ({ src, ...rest }: Props) => {
  const path: string = IS_ABSOLUTE_PATH.test(src || '')
    ? src
    : `${RESOURCES_BASE_URL}${src}`
  return (
    // eslint-disable-next-line jsx-a11y/alt-text
    <img src={path} {...rest} />
  )
}

export default Image
