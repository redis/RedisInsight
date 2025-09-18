import React from 'react'
import { EuiLinkProps } from '@elastic/eui/src/components/link/link'
import { LinkButtonVariants } from '@redis-ui/components'
import { IconProps } from 'uiSrc/components/base/icons'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { Link } from 'uiSrc/components/base/link/Link'

export type Props = EuiLinkProps & {
  href: string
  iconPosition?: 'left' | 'right'
  iconSize?: IconProps['size']
  variant?: LinkButtonVariants
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
