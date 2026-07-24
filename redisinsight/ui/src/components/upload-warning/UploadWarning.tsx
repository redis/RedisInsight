import React from 'react'
import { Text } from 'uiSrc/components/base/text'
import { UploadWarningBanner } from 'uiSrc/components/upload-warning/styles'
import { useTranslation } from 'uiSrc/i18n'

const UploadWarning = () => {
  const { t } = useTranslation()
  return (
    <UploadWarningBanner
      message={
        <Text size="s" component="span">
          {t('common.uploadWarning')}
        </Text>
      }
      show
      showIcon
      variant="attention"
    />
  )
}

export default UploadWarning
