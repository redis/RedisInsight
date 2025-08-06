import React from 'react'
import { useSelector } from 'react-redux'
import cx from 'classnames'
import { useHistory } from 'react-router-dom'
import { RiPrimaryButton } from 'uiBase/forms'
import { RiLink } from 'uiBase/display'
import {
  FeatureFlags,
  MODULE_NOT_LOADED_CONTENT as CONTENT,
  Pages,
} from 'uiSrc/constants'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import styles from 'uiSrc/components/messages/module-not-loaded/styles.module.scss'
import { FeatureFlagComponent, OAuthSsoHandlerDialog } from 'uiSrc/components'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import { EXTERNAL_LINKS, UTM_CAMPAINGS } from 'uiSrc/constants/links'
import {
  OAuthSocialAction,
  OAuthSocialSource,
  RedisDefaultModules,
} from 'uiSrc/slices/interfaces'

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
      <RiLink
        className={cx(styles.text, styles.link)}
        target="_blank"
        href={getUtmExternalLink(CONTENT[moduleName]?.link, {
          campaign: utmCampaign,
        })}
        data-testid="learn-more-link"
      >
        Learn More
      </RiLink>
      <FeatureFlagComponent
        name={FeatureFlags.cloudAds}
        otherwise={
          <RiLink
            className={styles.link}
            target="_blank"
            href=""
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()

              history.push(Pages.home)
            }}
            data-testid="get-started-link"
          >
            <RiPrimaryButton size="s" className={styles.btnLink}>
              Redis Databases page
            </RiPrimaryButton>
          </RiLink>
        }
      >
        <OAuthSsoHandlerDialog>
          {(ssoCloudHandlerClick) => (
            <RiLink
              className={styles.link}
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
              <RiPrimaryButton size="s" className={styles.btnLink}>
                Get Started For Free
              </RiPrimaryButton>
            </RiLink>
          )}
        </OAuthSsoHandlerDialog>
      </FeatureFlagComponent>
    </>
  )
}

export default ModuleNotLoadedButton
