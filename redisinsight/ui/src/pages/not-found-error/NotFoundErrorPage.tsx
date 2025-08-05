import React, { useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { FeatureFlags } from 'uiSrc/constants/featureFlags'
import { getConfig } from 'uiSrc/config'
import Robot from 'uiSrc/assets/img/robot.svg?react'
import { Col, FlexItem } from 'uiSrc/components/base/layout/flex'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { Title } from 'uiSrc/components/base/text/Title'
import { Text } from 'uiSrc/components/base/text'
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
      <Col align="start" className={styles.notfoundgroup}>
        <FlexItem grow>
          <Col align="start" gap="xl">
            <FlexItem grow>
              <RiIcon
                className={styles.logoIcon}
                size="original"
                type="RedisLogoFullIcon"
              />
            </FlexItem>
            <FlexItem grow>
              <Title size="XXL">
                Whoops!
                <br />
                This Page Is an Empty Set
              </Title>
              <Text component="div">
                <p
                  className={styles.errorSubtext}
                  style={{ marginBottom: '.8rem' }}
                >
                  We searched every shard, <br />
                  But couldn&apos;t find the page you&apos;re after.
                </p>
                <PrimaryButton
                  size="s"
                  onClick={onDbButtonClick}
                  data-testid="not-found-db-list-button"
                >
                  Databases page
                </PrimaryButton>
              </Text>
            </FlexItem>
          </Col>
        </FlexItem>
      </Col>
      <div className={styles.robotHolder}>
        <Robot className={styles.robot} />
      </div>
    </div>
  )
}

export default NotFoundErrorPage
