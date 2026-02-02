import React from 'react'

import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import { Title } from 'uiSrc/components/base/text/Title'
import { Text } from 'uiSrc/components/base/text'
import * as S from './UnsupportedTypeDetails.styles'
import TextDetailsWrapper from '../text-details-wrapper/TextDetailsWrapper'

const UnsupportedTypeDetails = ({ onClose }: { onClose: () => void }) => (
  <TextDetailsWrapper onClose={onClose} testid="unsupported-type">
    <Title size="M">This key type is not currently supported.</Title>
    <Text size="s">
      See{' '}
      <S.Link href={EXTERNAL_LINKS.githubRepo} target="_blank" rel="noreferrer">
        our repository
      </S.Link>{' '}
      for the list of supported key types.
    </Text>
  </TextDetailsWrapper>
)

export default UnsupportedTypeDetails
