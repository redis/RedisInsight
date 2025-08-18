import React from 'react'

import { RiTitle, RiText } from 'uiBase/text'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import TextDetailsWrapper from '../text-details-wrapper/TextDetailsWrapper'

import styles from './styles.module.scss'

const UnsupportedTypeDetails = ({ onClose }: { onClose: () => void }) => (
  <TextDetailsWrapper onClose={onClose} testid="unsupported-type">
    <RiTitle size="M">This key type is not currently supported.</RiTitle>
    <RiText size="s">
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
    </RiText>
  </TextDetailsWrapper>
)

export default UnsupportedTypeDetails
