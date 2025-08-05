import React from 'react'
import { EuiLinkProps } from '@elastic/eui/src/components/link/link'
import { IconProps } from 'uiSrc/components/base/icons'
import { RiIcon } from 'uiSrc/components/base/icons'
import { Link } from 'uiSrc/components/base/link/Link'

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
    <Link {...rest} target="_blank">
      {iconPosition === 'left' && <ArrowIcon />}
      {children}
      {iconPosition === 'right' && <ArrowIcon />}
    </Link>
  )
}

export default ExternalLink
