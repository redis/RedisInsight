import React from 'react'
import { useAppSelector } from 'uiSrc/slices/hooks'
import { useHistory } from 'react-router-dom'

import { RedisToolsTrigger, InsightsTrigger } from 'uiSrc/components/triggers'
import {
  FeatureFlagComponent,
  OAuthUserProfile,
  RiTooltip,
} from 'uiSrc/components'
import { FeatureFlags, Pages } from 'uiSrc/constants'
import { OAuthSocialSource } from 'uiSrc/slices/interfaces'
import { connectedInstanceSelector } from 'uiSrc/slices/rdi/instances'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { useTranslation } from 'uiSrc/i18n'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { Link } from 'uiSrc/components/base/link/Link'
import InstancesNavigationPopover from '../instance-header/components/instances-navigation-popover'
import styles from './styles.module.scss'

/**
 * The trail of the open v2 pipeline page. It matches `RdiPipelinesBreadcrumbState`
 * from @rdi-ui/pipeline, whose links run through the open pipeline's
 * unsaved-changes check.
 */
export interface RdiPipelineBreadcrumb {
  /** The open pipeline, or `undefined` while the pipeline list shows. */
  pipelineName?: string
  exit: () => void
  showList: () => void
}

export interface Props {
  pipelineBreadcrumb?: RdiPipelineBreadcrumb
}

const RdiInstanceHeader = ({ pipelineBreadcrumb }: Props) => {
  const { t } = useTranslation()
  const { name = '' } = useAppSelector(connectedInstanceSelector)
  const { [FeatureFlags.redisTools]: redisToolsFeature } = useAppSelector(
    appFeatureFlagsFeaturesSelector,
  )
  const isRedisToolsAvailable = !!redisToolsFeature?.flag
  const history = useHistory()

  const goHome = () => {
    if (pipelineBreadcrumb) {
      pipelineBreadcrumb.exit()
      return
    }
    history.push(Pages.rdi)
  }

  const pipelineName = pipelineBreadcrumb?.pipelineName

  return (
    <Row className={styles.container} align="center">
      <FlexItem style={{ overflow: 'hidden' }} grow>
        <div
          className={styles.breadcrumbsContainer}
          data-testid="breadcrumbs-container"
        >
          <div>
            <RiTooltip
              position="bottom"
              content={t('rdiInstanceHeader.myRdiInstances')}
            >
              <Link
                color="subdued"
                underline
                variant="inline"
                aria-label={t('rdiInstanceHeader.myRdiInstances')}
                data-testid="my-rdi-instances-btn"
                onClick={goHome}
              >
                {t('rdiInstanceHeader.dataIntegration')}
              </Link>
            </RiTooltip>
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ maxWidth: '100%' }}>
              <Row align="center">
                <FlexItem>
                  <Text className={styles.divider}>/</Text>
                </FlexItem>
                <FlexItem grow={!pipelineName} style={{ overflow: 'hidden' }}>
                  <InstancesNavigationPopover
                    name={name}
                    onNameClick={
                      pipelineName ? pipelineBreadcrumb?.showList : undefined
                    }
                  />
                </FlexItem>
                {pipelineName && (
                  <>
                    <FlexItem>
                      <Text className={styles.divider}>/</Text>
                    </FlexItem>
                    <FlexItem grow style={{ overflow: 'hidden' }}>
                      <Text
                        color="primary"
                        className={styles.rdiName}
                        data-testid="rdi-pipeline-name"
                      >
                        {pipelineName}
                      </Text>
                    </FlexItem>
                  </>
                )}
              </Row>
            </div>
          </div>
        </div>
      </FlexItem>

      {isRedisToolsAvailable && (
        <FlexItem style={{ marginRight: 12 }}>
          <RedisToolsTrigger />
        </FlexItem>
      )}
      <FlexItem style={{ marginLeft: 12 }}>
        <InsightsTrigger />
      </FlexItem>

      <FeatureFlagComponent
        name={[FeatureFlags.cloudSso, FeatureFlags.cloudAds]}
      >
        <FlexItem
          style={{ marginLeft: 16 }}
          data-testid="o-auth-user-profile-rdi"
        >
          <OAuthUserProfile source={OAuthSocialSource.UserProfile} />
        </FlexItem>
      </FeatureFlagComponent>
    </Row>
  )
}

export default RdiInstanceHeader
