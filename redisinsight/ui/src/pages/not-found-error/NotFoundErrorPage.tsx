import React, { useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { FeatureFlags } from 'uiSrc/constants/featureFlags'
import { getConfig } from 'uiSrc/config'
import Robot from 'uiSrc/assets/img/robot.svg?react'
import { RiCol, RiFlexItem } from 'uiSrc/components/base/layout'
import { RiPrimaryButton } from 'uiSrc/components/base/forms'
import { RiTitle, RiText } from 'uiSrc/components/base/text'
import { RiIcon } from 'uiSrc/components/base/icons'
import styles from './styles.module.scss'

const NotFoundErrorPage = () => {
  const history = useHistory()
  const config = getConfig()
  const { [FeatureFlags.envDependent]: envDependentFeature } = useSelector(
    appFeatureFlagsFeaturesSelector,
  )

  const onDbButtonClick = useCallback(() => {
    if (envDependentFeature?.flag) {
      history.push('/')
    } else {
      window.location.href = `${config.app.activityMonitorOrigin}/#/databases`
    }
  }, [envDependentFeature, config])

  return (
    <div className={styles.notfoundpage}>
      <RiCol align="start" className={styles.notfoundgroup}>
        <RiFlexItem grow>
          <RiCol align="start" gap="xl">
            <RiFlexItem grow>
              <RiIcon
                className={styles.logoIcon}
                size="original"
                type="RedisLogoFullIcon"
              />
            </RiFlexItem>
            <RiFlexItem grow>
              <RiTitle size="XXL">
                Whoops!
                <br />
                This Page Is an Empty Set
              </RiTitle>
              <RiText component="div">
                <p
                  className={styles.errorSubtext}
                  style={{ marginBottom: '.8rem' }}
                >
                  We searched every shard, <br />
                  But couldn&apos;t find the page you&apos;re after.
                </p>
                <RiPrimaryButton
                  size="s"
                  onClick={onDbButtonClick}
                  data-testid="not-found-db-list-button"
                >
                  Databases page
                </RiPrimaryButton>
              </RiText>
            </RiFlexItem>
          </RiCol>
        </RiFlexItem>
      </RiCol>
      <div className={styles.robotHolder}>
        <Robot className={styles.robot} />
      </div>
    </div>
  )
}

export default NotFoundErrorPage
