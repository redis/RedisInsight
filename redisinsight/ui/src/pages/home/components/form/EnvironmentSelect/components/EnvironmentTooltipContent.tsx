import React from 'react'

import { Text } from 'uiSrc/components/base/text/Text'
import { Trans, useTranslation } from 'uiSrc/i18n'

const EnvironmentTooltipContent = () => {
  const { t } = useTranslation()

  return (
    <>
      <Text>{t('home.form.environment.tooltip.description')}</Text>
      <Text>
        <Trans
          i18nKey="home.form.environment.tooltip.production"
          components={{ strong: <strong /> }}
        />
      </Text>
      <Text>
        <Trans
          i18nKey="home.form.environment.tooltip.development"
          components={{ strong: <strong /> }}
        />
      </Text>
      <Text>
        <Trans
          i18nKey="home.form.environment.tooltip.unspecified"
          components={{ strong: <strong /> }}
        />
      </Text>
    </>
  )
}

export default EnvironmentTooltipContent
