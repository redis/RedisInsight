import React from 'react'

import { RiTitle, RiText } from 'uiBase/text'
import TextDetailsWrapper from '../text-details-wrapper/TextDetailsWrapper'

const TooLongKeyNameDetails = ({ onClose }: { onClose: () => void }) => (
  <TextDetailsWrapper onClose={onClose} testid="too-long-key-name">
    <RiTitle size="M">The key name is too long</RiTitle>
    <RiText size="s">Details cannot be displayed.</RiText>
  </TextDetailsWrapper>
)

export default TooLongKeyNameDetails
