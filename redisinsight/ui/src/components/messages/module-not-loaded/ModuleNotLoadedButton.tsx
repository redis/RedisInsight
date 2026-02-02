import React from 'react'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import {
  FeatureFlags,
  MODULE_NOT_LOADED_CONTENT as CONTENT,
  Pages,
} from 'uiSrc/constants'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { FeatureFlagComponent, OAuthSsoHandlerDialog } from 'uiSrc/components'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import { EXTERNAL_LINKS, UTM_CAMPAINGS } from 'uiSrc/constants/links'
import {
  OAuthSocialAction,
  OAuthSocialSource,
  RedisDefaultModules,
} from 'uiSrc/slices/interfaces'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { Link } from 'uiSrc/components/base/link/Link'
import * as S from './ModuleNotLoaded.styles'

export interface IProps {
  moduleName: RedisDefaultModules
  module?: String
  onClose?: () => void
  type?: 'workbench' | 'browser'
}

const ModuleNotLoadedButton = ({
  moduleName,
  type,
  onClose,
  module,
}: IProps) => {
  const history = useHistory()
  const { [FeatureFlags.envDependent]: envDependentFeature } = useSelector(
    appFeatureFlagsFeaturesSelector,
  )

  const utmCampaign =
    type === 'browser'
      ? UTM_CAMPAINGS[OAuthSocialSource.BrowserSearch]
      : UTM_CAMPAINGS[OAuthSocialSource.Workbench]

  if (!envDependentFeature?.flag) {
    return null
  }

  return (
    <>
      <S.Link>
        <Link
          target="_blank"
          href={getUtmExternalLink(CONTENT[moduleName]?.link, {
            campaign: utmCampaign,
          })}
          data-testid="learn-more-link"
        >
          <S.ModuleText>Learn More</S.ModuleText>
        </Link>
      </S.Link>
      <FeatureFlagComponent
        name={FeatureFlags.cloudAds}
        otherwise={
          <S.Link>
            <Link
              target="_blank"
              href=""
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()

                history.push(Pages.home)
              }}
              data-testid="get-started-link"
            >
              <PrimaryButton size="s">Redis Databases page</PrimaryButton>
            </Link>
          </S.Link>
        }
      >
        <OAuthSsoHandlerDialog>
          {(ssoCloudHandlerClick) => (
            <S.Link>
              <Link
                target="_blank"
                href={getUtmExternalLink(EXTERNAL_LINKS.tryFree, {
                  campaign: utmCampaign,
                })}
                onClick={(e) => {
                  ssoCloudHandlerClick(e, {
                    source:
                      type === 'browser'
                        ? OAuthSocialSource.BrowserSearch
                        : OAuthSocialSource[
                            module as keyof typeof OAuthSocialSource
                          ],
                    action: OAuthSocialAction.Create,
                  })
                  onClose?.()
                }}
                data-testid="get-started-link"
              >
                <PrimaryButton size="s">Get Started For Free</PrimaryButton>
              </Link>
            </S.Link>
          )}
        </OAuthSsoHandlerDialog>
      </FeatureFlagComponent>
    </>
  )
}

export default ModuleNotLoadedButton
