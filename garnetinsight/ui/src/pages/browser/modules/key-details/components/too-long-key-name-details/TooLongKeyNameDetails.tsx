import React from 'react'

import { Title } from 'uiSrc/components/base/text/Title'
import { Text } from 'uiSrc/components/base/text'
import TextDetailsWrapper from '../text-details-wrapper/TextDetailsWrapper'

const TooLongKeyNameDetails = ({ onClose }: { onClose: () => void }) => (
  <TextDetailsWrapper onClose={onClose} testid="too-long-key-name">
    <Title size="M">The key name is too long</Title>
    <Text size="s">Details cannot be displayed.</Text>
  </TextDetailsWrapper>
)

export default TooLongKeyNameDetails
