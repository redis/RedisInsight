import React from 'react'
import { EuiLinkProps } from '@elastic/eui/src/components/link/link'
import { IconProps, RiIcon } from 'uiSrc/components/base/icons'
import { RiLink } from 'uiSrc/components/base/display'

export type Props = EuiLinkProps & {
  href: string
  iconPosition?: 'left' | 'right'
  iconSize?: IconProps['size']
}

const ExternalLink = (props: Props) => {
  const { iconPosition = 'right', iconSize = 'M', children, ...rest } = props

  const ArrowIcon = () => (
    <RiIcon type="ArrowDiagonalIcon" size={iconSize} color="informative400" />
  )

  return (
    <RiLink {...rest} target="_blank">
      {iconPosition === 'left' && <ArrowIcon />}
      {children}
      {iconPosition === 'right' && <ArrowIcon />}
    </RiLink>
  )
}

export default ExternalLink
