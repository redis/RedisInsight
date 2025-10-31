import React from 'react'
import { IconProps } from 'uiSrc/components/base/icons'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { Link, type RiLinkProps } from 'uiSrc/components/base/link/Link'

export type Props = RiLinkProps & {
  href: string
  iconPosition?: 'left' | 'right'
  iconSize?: IconProps['size']
  variant?: RiLinkProps['variant']
  size?: RiLinkProps['size']
  color?: RiLinkProps['color']
}

const ExternalLink = (props: Props) => {
  const {
    iconPosition = 'right',
    iconSize = 'S',
    size = 'S',
    children,
    ...rest
  } = props

  const ArrowIcon = () => (
    <RiIcon
      type="ArrowDiagonalIcon"
      size={iconSize || size}
      color="informative400"
    />
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
