import React from 'react'
import { useTranslation } from 'uiSrc/i18n'
import { useAppSelector } from 'uiSrc/slices/hooks'

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
  svg {
    width: 30px;
    height: 34px;
  }
`

export const RedisLogo = ({ isRdiWorkspace }: Props) => {
  const { t } = useTranslation()
  const { envDependent } = useAppSelector(appFeatureFlagsFeaturesSelector)
  const { server } = useAppSelector(appInfoSelector)

  if (!envDependent?.flag) {
    return (
      <RedisLogoIcon>
        <SideBarItemIcon
          height="50px"
          width="50px"
          aria-label={t('navigation.homepage.ariaLabel')}
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
              ? t('home.databaseList.controls.button.editDatabase')
              : isRdiWorkspace
                ? t('homeTabs.rdiInstances')
                : t('homeTabs.redisDatabases'),
          placement: 'right',
        }}
        style={{ marginBlock: '2rem', marginInline: 'auto' }}
      >
        <SideBarItemIcon icon={RedisLogoDarkMinIcon} />
      </SideBarItem>
    </Link>
  )
}
