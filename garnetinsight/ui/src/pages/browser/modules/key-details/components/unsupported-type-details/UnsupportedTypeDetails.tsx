import React from 'react'

import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import { Title } from 'uiSrc/components/base/text/Title'
import { Text } from 'uiSrc/components/base/text'
import TextDetailsWrapper from '../text-details-wrapper/TextDetailsWrapper'

import styles from './styles.module.scss'

const UnsupportedTypeDetails = ({ onClose }: { onClose: () => void }) => (
  <TextDetailsWrapper onClose={onClose} testid="unsupported-type">
    <Title size="M">This key type is not currently supported.</Title>
    <Text size="s">
      See{' '}
      <a
        href={EXTERNAL_LINKS.githubRepo}
        className={styles.link}
        target="_blank"
        rel="noreferrer"
      >
        our repository
      </a>{' '}
      for the list of supported key types.
    </Text>
  </TextDetailsWrapper>
)

export default UnsupportedTypeDetails
