import React from 'react'
import { Button } from 'uiSrc/components/base/forms/buttons'
import { Col } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'

import useStartWizard from '../../hooks/useStartWizard'
import { StyledContainer, StyledImage } from './NoDataMessage.styles'
import { NO_DATA_MESSAGES, NoDataMessageKeys } from './data'
import useRedisInstanceCompatibility from '../../create-index/hooks/useRedisInstanceCompatibility'

export interface NoDataMessageProps {
  variant: NoDataMessageKeys
}

const NoDataMessage = ({ variant }: NoDataMessageProps) => {
  const start = useStartWizard()
  const { loading, hasSupportedVersion } = useRedisInstanceCompatibility()
  const { title, description, icon } = NO_DATA_MESSAGES[variant]

  return (
    <StyledContainer gap="xxl" data-testid="no-data-message">
      <StyledImage src={icon} alt={title} as="img" />

      <Col gap="m">
        <Text size="M">{title}</Text>
        <Text size="S">{description}</Text>
      </Col>

      {loading === false && hasSupportedVersion === true && (
        <Button variant="secondary-invert" onClick={start}>
          Get started
        </Button>
      )}
    </StyledContainer>
  )
}

export default NoDataMessage
