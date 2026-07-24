import React from 'react'

import { Title } from 'uiSrc/components/base/text/Title'
import { Text } from 'uiSrc/components/base/text'
import { useTranslation } from 'uiSrc/i18n'
import TextDetailsWrapper from '../text-details-wrapper/TextDetailsWrapper'

const TooLongKeyNameDetails = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation()
  return (
    <TextDetailsWrapper onClose={onClose} testid="too-long-key-name">
      <Title size="M">{t('browser.keyDetails.tooLongName.title')}</Title>
      <Text size="s">{t('browser.keyDetails.tooLongName.message')}</Text>
    </TextDetailsWrapper>
  )
}

export default TooLongKeyNameDetails
