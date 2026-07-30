import React from 'react'

import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import { Title } from 'uiSrc/components/base/text/Title'
import { Text } from 'uiSrc/components/base/text'
import { Trans, useTranslation } from 'uiSrc/i18n'
import TextDetailsWrapper from '../text-details-wrapper/TextDetailsWrapper'

import styles from './styles.module.scss'

const UnsupportedTypeDetails = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation()
  return (
    <TextDetailsWrapper onClose={onClose} testid="unsupported-type">
      <Title size="M">{t('browser.keyDetails.unsupportedType.title')}</Title>
      <Text size="s">
        <Trans
          i18nKey="browser.keyDetails.unsupportedType.message"
          components={{
            repoLink: (
              <a
                href={EXTERNAL_LINKS.githubRepo}
                className={styles.link}
                target="_blank"
                rel="noreferrer"
              >
                {''}
              </a>
            ),
          }}
        />
      </Text>
    </TextDetailsWrapper>
  )
}

export default UnsupportedTypeDetails
