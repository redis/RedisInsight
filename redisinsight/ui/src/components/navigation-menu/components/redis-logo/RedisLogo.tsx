import cx from 'classnames'
import React from 'react'
import { useSelector } from 'react-redux'

import { RiSideBarItem, SideBarItemIcon } from 'uiBase/layout'
import { RiLink } from 'uiBase/display'
import { BuildType } from 'uiSrc/constants/env'
import { appInfoSelector } from 'uiSrc/slices/app/info'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { getRouterLinkProps } from 'uiSrc/services'
import { Pages } from 'uiSrc/constants'
import LogoSVG from 'uiSrc/assets/img/logo_small.svg?react'
import styles from '../../styles.module.scss'

type Props = {
  isRdiWorkspace: boolean
}

export const RedisLogo = ({ isRdiWorkspace }: Props) => {
  const { envDependent } = useSelector(appFeatureFlagsFeaturesSelector)
  const { server } = useSelector(appInfoSelector)

  if (!envDependent?.flag) {
    return (
      <span className={cx(styles.iconNavItem, styles.homeIcon)}>
        <SideBarItemIcon aria-label="Redis Insight Homepage" icon={LogoSVG} />
      </span>
    )
  }

  return (
    <RiLink
      {...getRouterLinkProps(isRdiWorkspace ? Pages.rdi : Pages.home)}
      data-testid="redis-logo-link"
      style={{ backgroundColor: 'transparent' }}
    >
      <RiSideBarItem
        tooltipProps={{
          text:
            server?.buildType === BuildType.RedisStack
              ? 'Edit database'
              : isRdiWorkspace
                ? 'Redis Data Integration'
                : 'Redis Databases',
          placement: 'right',
        }}
        style={{ marginBlock: '2rem', marginInline: 'auto' }}
      >
        <SideBarItemIcon icon={LogoSVG} />
      </RiSideBarItem>
    </RiLink>
  )
}
