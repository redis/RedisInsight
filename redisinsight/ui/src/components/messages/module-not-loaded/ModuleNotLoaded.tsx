import React, { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import MobileIcon from 'uiSrc/assets/img/icons/mobile_module_not_loaded.svg?react'
import DesktopIcon from 'uiSrc/assets/img/icons/module_not_loaded.svg?react'
import TelescopeImg from 'uiSrc/assets/img/telescope-dark.svg?react'
import CheerIcon from 'uiSrc/assets/img/icons/cheer.svg?react'
import {
  FeatureFlags,
  MODULE_NOT_LOADED_CONTENT as CONTENT,
  MODULE_TEXT_VIEW,
} from 'uiSrc/constants'
import { OAuthSocialSource, RedisDefaultModules } from 'uiSrc/slices/interfaces'
import { OAuthConnectFreeDb } from 'uiSrc/components'
import { freeInstancesSelector } from 'uiSrc/slices/instances/instances'

import { getDbWithModuleLoaded } from 'uiSrc/utils'
import { useCapability } from 'uiSrc/services'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { Title } from 'uiSrc/components/base/text/Title'
import { ColorText, Text } from 'uiSrc/components/base/text'
import { Spacer } from 'uiSrc/components/base/layout'
import ModuleNotLoadedButton from './ModuleNotLoadedButton'
import * as S from './ModuleNotLoaded.styles'

export const MODULE_OAUTH_SOURCE_MAP: {
  [key in RedisDefaultModules]?: String
} = {
  [RedisDefaultModules.Bloom]: 'RedisBloom',
  [RedisDefaultModules.ReJSON]: 'RedisJSON',
  [RedisDefaultModules.Search]: 'RediSearch',
  [RedisDefaultModules.TimeSeries]: 'RedisTimeSeries',
}

export interface IProps {
  moduleName: RedisDefaultModules
  id: string
  onClose?: () => void
  type?: 'workbench' | 'browser'
}

const MIN_ELEMENT_WIDTH = 1210
const MAX_ELEMENT_WIDTH = 1440

const renderTitle = (
  width: number,
  moduleName?: string,
  fullScreen?: boolean,
  modal?: boolean,
) => (
  <Title size="M" data-testid="welcome-page-title">
    <S.ModuleTitle $fullScreen={fullScreen} $modal={modal}>
      {`${moduleName?.substring(0, 1).toUpperCase()}${moduleName?.substring(1)} ${[MODULE_TEXT_VIEW.redisgears, MODULE_TEXT_VIEW.bf].includes(moduleName) ? 'are' : 'is'} not available `}
      {width > MAX_ELEMENT_WIDTH && <br />}
      for this database
    </S.ModuleTitle>
  </Title>
)

const ListItemComponent = ({
  item,
  fullScreen,
  bloom,
}: {
  item: string
  fullScreen?: boolean
  bloom?: boolean
}) => (
  <S.ListItem $fullScreen={fullScreen} $bloom={bloom}>
    <S.IconWrapper>
      <S.ListIcon>
        <CheerIcon />
      </S.ListIcon>
    </S.IconWrapper>
    <ColorText>
      <S.ModuleText $fullScreen={fullScreen}>{item}</S.ModuleText>
    </ColorText>
  </S.ListItem>
)

const ModuleNotLoaded = ({
  moduleName,
  id,
  type = 'workbench',
  onClose,
}: IProps) => {
  const [width, setWidth] = useState(0)
  const freeInstances = useSelector(freeInstancesSelector) || []
  const { [FeatureFlags.cloudAds]: cloudAdsFeature } = useSelector(
    appFeatureFlagsFeaturesSelector,
  )

  const module = MODULE_OAUTH_SOURCE_MAP[moduleName]

  const freeDbWithModule = getDbWithModuleLoaded(freeInstances, moduleName)
  const source =
    type === 'browser'
      ? OAuthSocialSource.BrowserSearch
      : OAuthSocialSource[module as keyof typeof OAuthSocialSource]

  useCapability(source)

  useEffect(() => {
    const parentEl = document?.getElementById(id)
    if (parentEl) {
      setWidth(parentEl.offsetWidth)
    }
  })

  const isFullScreen = width > MAX_ELEMENT_WIDTH || type === 'browser'
  const isModal = type === 'browser'
  const isBloom = moduleName === RedisDefaultModules.Bloom

  const renderText = useCallback(
    (moduleNameText?: string) => {
      if (!cloudAdsFeature?.flag) {
        return (
          <Text>
            <S.MarginBottom>
              <S.ModuleText $fullScreen={isFullScreen}>
                Open a database with {moduleNameText}.
              </S.ModuleText>
            </S.MarginBottom>
          </Text>
        )
      }

      return !freeDbWithModule ? (
        <Text>
          <S.MarginBottom>
            <S.ModuleText $fullScreen={isFullScreen}>
              Create a free all-in-one Redis Cloud database to start exploring
              these capabilities.
            </S.ModuleText>
          </S.MarginBottom>
        </Text>
      ) : (
        <Text>
          <S.MarginBottom>
            <S.ModuleText $fullScreen={isFullScreen}>
              <S.TextFooter>
                Use your free all-in-one Redis Cloud database to start exploring
                these capabilities.
              </S.TextFooter>
            </S.ModuleText>
          </S.MarginBottom>
        </Text>
      )
    },
    [freeDbWithModule, isFullScreen],
  )

  return (
    <S.Container $fullScreen={isFullScreen} $modal={isModal}>
      <S.FlexRow $fullScreen={isFullScreen}>
        <div>
          {type !== 'browser' &&
            (width > MAX_ELEMENT_WIDTH ? (
              <S.BigIcon>
                <DesktopIcon />
              </S.BigIcon>
            ) : (
              <S.Icon>
                <MobileIcon />
              </S.Icon>
            ))}
          {type === 'browser' && (
            <S.IconTelescope>
              <TelescopeImg />
            </S.IconTelescope>
          )}
        </div>
        <S.ContentWrapper
          $fullScreen={isFullScreen}
          data-testid="module-not-loaded-content"
        >
          {renderTitle(
            width,
            MODULE_TEXT_VIEW[moduleName],
            isFullScreen,
            isModal,
          )}
          <Spacer size="l" />
          <Text>
            <S.BigText $fullScreen={isFullScreen} $modal={isModal}>
              {CONTENT[moduleName]?.text.map((item: string) =>
                width > MIN_ELEMENT_WIDTH ? (
                  <span key={item}>
                    {item}
                    <br />
                  </span>
                ) : (
                  item
                ),
              )}
            </S.BigText>
          </Text>
          <Spacer size="m" />
          <S.List $bloom={isBloom} $fullScreen={isFullScreen}>
            {CONTENT[moduleName]?.improvements.map((item: string) => (
              <ListItemComponent
                key={item}
                item={item}
                fullScreen={isFullScreen}
                bloom={isBloom}
              />
            ))}
          </S.List>
          {!!CONTENT[moduleName]?.additionalText && (
            <>
              <Spacer size="l" />
              <Text>
                <S.MarginBottom>
                  <S.ModuleText $fullScreen={isFullScreen}>
                    {CONTENT[moduleName]?.additionalText.map((item: string) =>
                      width > MIN_ELEMENT_WIDTH ? (
                        <span key={item}>
                          {item}
                          <br />
                        </span>
                      ) : (
                        item
                      ),
                    )}
                  </S.ModuleText>
                </S.MarginBottom>
              </Text>
            </>
          )}
          {renderText(MODULE_TEXT_VIEW[moduleName])}
        </S.ContentWrapper>
      </S.FlexRow>
      <S.LinksWrapper
        $fullScreen={isFullScreen}
        data-testid="module-not-loaded-cta-wrapper"
      >
        {freeDbWithModule ? (
          <OAuthConnectFreeDb source={source} id={freeDbWithModule.id} />
        ) : (
          <ModuleNotLoadedButton
            moduleName={moduleName}
            module={module}
            type={type}
            onClose={onClose}
          />
        )}
      </S.LinksWrapper>
    </S.Container>
  )
}

export default React.memo(ModuleNotLoaded)
