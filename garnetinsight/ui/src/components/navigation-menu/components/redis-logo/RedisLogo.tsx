import React from 'react'
import { useSelector } from 'react-redux'

import { BuildType } from 'uiSrc/constants/env'
import { appInfoSelector } from 'uiSrc/slices/app/info'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import {
  SideBarItem,
  SideBarItemIcon,
} from 'uiSrc/components/base/layout/sidebar'
import { getRouterLinkProps } from 'uiSrc/services'
import { Pages } from 'uiSrc/constants'
import { Link } from 'uiSrc/components/base/link/Link'
import { RedisLogoDarkMinIcon } from 'uiSrc/components/base/icons'
import styled from 'styled-components'

type Props = {
  isRdiWorkspace: boolean
}

const RedisLogoIcon = styled.span`
  height: 60px;
  width: 100%;
  @media only screen and (min-width: 768px) {
    height: 72px;
  }
  svg, img {
    width: 30px;
    height: auto;
  }
`

export const RedisLogo = ({ isRdiWorkspace }: Props) => {
  const { envDependent } = useSelector(appFeatureFlagsFeaturesSelector)
  const { server } = useSelector(appInfoSelector)

  if (!envDependent?.flag) {
    return (
      <RedisLogoIcon>
        <SideBarItemIcon height="50px" width="50px"
          aria-label="Garnet Insight Homepage"
          icon={RedisLogoDarkMinIcon}
          centered
        />
      </RedisLogoIcon>
    )
  }

  return (
    <Link
      {...getRouterLinkProps(isRdiWorkspace ? Pages.rdi : Pages.home)}
      data-testid="redis-logo-link"
      style={{ backgroundColor: 'transparent' }}
    >
      <SideBarItem
        tooltipProps={{
          text:
            server?.buildType === BuildType.RedisStack
              ? 'Edit database'
              : isRdiWorkspace
                ? 'Redis Data Integration'
                : 'Garnet Databases',
          placement: 'right',
        }}
        style={{ marginBlock: '2rem', marginInline: 'auto' }}
      >
        <SideBarItemIcon icon={RedisLogoDarkMinIcon} />
      </SideBarItem>
    </Link>
  )
}
