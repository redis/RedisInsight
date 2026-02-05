import React from 'react'
import { useSelector } from 'react-redux'
import { Button } from 'uiSrc/components/base/forms/buttons'
import { Col } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { FeatureFlags } from 'uiSrc/constants'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'

import useStartWizard from '../../hooks/useStartWizard'
import { StyledContainer, StyledImage } from './NoDataMessage.styles'
import { NO_DATA_MESSAGES, NoDataMessageKeys } from './data'
import useRedisInstanceCompatibility from '../../create-index/hooks/useRedisInstanceCompatibility'

export interface NoDataMessageProps {
  variant: NoDataMessageKeys
}

/**
 * @deprecated This component is deprecated. Use the new NewSearchResults component instead.
 * @see redisinsight/ui/src/pages/vector-search/components/no-search-results
 */
const NoDataMessage = ({ variant }: NoDataMessageProps) => {
  const { [FeatureFlags.vectorSearch]: vectorSearchFeature } = useSelector(
    appFeatureFlagsFeaturesSelector,
  )

  const start = useStartWizard()
  const { loading, hasSupportedVersion } = useRedisInstanceCompatibility()
  const { title, description, icon, imgStyle } = NO_DATA_MESSAGES[variant]

  return (
    <StyledContainer gap="xxl" data-testid="no-data-message">
      <StyledImage src={icon} alt={title} as="img" style={imgStyle} />

      <Col gap="m">
        <Text size="M">{title}</Text>
        {vectorSearchFeature?.flag && <Text size="S">{description}</Text>}
      </Col>

      {vectorSearchFeature?.flag &&
        loading === false &&
        hasSupportedVersion === true && (
          <Button variant="secondary-invert" onClick={start}>
            Get started
          </Button>
        )}
    </StyledContainer>
  )
}

export default NoDataMessage
