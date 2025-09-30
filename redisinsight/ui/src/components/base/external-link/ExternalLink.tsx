import React from 'react'
import { IconProps } from 'uiSrc/components/base/icons'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { Link, type LinkProps } from 'uiSrc/components/base/link/Link'

export type Props = LinkProps & {
  href: string
  iconPosition?: 'left' | 'right'
  iconSize?: IconProps['size']
  variant?: LinkProps['variant']
  size?: LinkProps['size']
}

const ExternalLink = (props: Props) => {
  const { iconPosition = 'right', iconSize = 'M', children, ...rest } = props

  const ArrowIcon = () => (
    <RiIcon type="ArrowDiagonalIcon" size={iconSize} color="informative400" />
  )

  return (
    <Link {...rest} target="_blank" rel="noopener noreferrer">
      {iconPosition === 'left' && <ArrowIcon />}
      {children}
      {iconPosition === 'right' && <ArrowIcon />}
    </Link>
  )
}

export default ExternalLink
