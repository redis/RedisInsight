import React from 'react'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import TelescopeImg from 'uiSrc/assets/img/telescope-dark.svg'
import {
  OAuthSocialAction,
  OAuthSocialSource,
  RedisDefaultModules,
} from 'uiSrc/slices/interfaces'
import { freeInstancesSelector } from 'uiSrc/slices/instances/instances'

import {
  ExternalLink,
  FeatureFlagComponent,
  OAuthConnectFreeDb,
  OAuthSsoHandlerDialog,
} from 'uiSrc/components'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import { EXTERNAL_LINKS, UTM_CAMPAINGS } from 'uiSrc/constants/links'
import {
  getDbWithModuleLoaded,
  getSourceTutorialByCapability,
} from 'uiSrc/utils'
import { useCapability } from 'uiSrc/services'
import { FeatureFlags, Pages } from 'uiSrc/constants'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { RiPrimaryButton } from 'uiSrc/components/base/forms'
import { Title } from 'uiSrc/components/base/text/Title'
import { Text } from 'uiSrc/components/base/text'
import {
  MODULE_CAPABILITY_TEXT_NOT_AVAILABLE,
  MODULE_CAPABILITY_TEXT_NOT_AVAILABLE_ENTERPRISE,
} from './constants'
import styles from './styles.module.scss'

export interface Props {
  moduleName: RedisDefaultModules
  source: OAuthSocialSource
  onClose?: () => void
}

const ModuleNotLoadedMinimalized = (props: Props) => {
  const history = useHistory()
  const { [FeatureFlags.cloudAds]: cloudAdsFeature } = useSelector(
    appFeatureFlagsFeaturesSelector,
  )
  const { moduleName, source, onClose } = props
  const freeInstances = useSelector(freeInstancesSelector) || []

  const sourceTutorial = getSourceTutorialByCapability(moduleName)
  const moduleText = cloudAdsFeature?.flag
    ? MODULE_CAPABILITY_TEXT_NOT_AVAILABLE[moduleName]
    : MODULE_CAPABILITY_TEXT_NOT_AVAILABLE_ENTERPRISE[moduleName]
  const freeDbWithModule = getDbWithModuleLoaded(freeInstances, moduleName)

  useCapability(sourceTutorial)

  return (
    <div className={styles.wrapper} data-testid="module-not-loaded-popover">
      <div>
        <Title size="S" className={styles.title}>
          {moduleText?.title}
        </Title>
        <Spacer size="s" />
        <FeatureFlagComponent
          name={FeatureFlags.cloudAds}
          otherwise={
            <>
              <Text color="subdued" size="s">
                {moduleText?.text}
              </Text>
              <Spacer size="s" />
              <RiPrimaryButton
                size="s"
                className={styles.btnLink}
                onClick={() => {
                  history.push(Pages.home)
                }}
              >
                Redis Databases page
              </RiPrimaryButton>
            </>
          }
        >
          {!freeDbWithModule ? (
            <>
              <Text color="subdued" size="s">
                {moduleText?.text}
              </Text>
              <Spacer size="s" />
              <OAuthSsoHandlerDialog>
                {(ssoCloudHandlerClick) => (
                  <ExternalLink
                    iconSize="S"
                    href={getUtmExternalLink(EXTERNAL_LINKS.tryFree, {
                      campaign: UTM_CAMPAINGS[source] ?? source,
                    })}
                    onClick={(e: React.MouseEvent) => {
                      ssoCloudHandlerClick(
                        e,
                        {
                          source,
                          action: OAuthSocialAction.Create,
                        },
                        `${moduleName}_${source}`,
                      )
                      onClose?.()
                    }}
                    data-testid="tutorials-get-started-link"
                  >
                    Start with Cloud for free
                  </ExternalLink>
                )}
              </OAuthSsoHandlerDialog>
            </>
          ) : (
            <>
              <Text color="subdued" size="s">
                Use your free trial all-in-one Redis Cloud database to start
                exploring these capabilities.
              </Text>
              <Spacer size="s" />
              <OAuthConnectFreeDb
                id={freeDbWithModule.id}
                source={sourceTutorial}
              />
            </>
          )}
        </FeatureFlagComponent>
      </div>
      <img
        src={TelescopeImg}
        className={styles.img}
        alt="telescope"
        loading="lazy"
      />
    </div>
  )
}

export default ModuleNotLoadedMinimalized
