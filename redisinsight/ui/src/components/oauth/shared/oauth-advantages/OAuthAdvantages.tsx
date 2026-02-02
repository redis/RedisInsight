import React from 'react'
import RedisLogo from 'uiSrc/assets/img/logo.svg'
import { Title } from 'uiSrc/components/base/text/Title'
import { Text } from 'uiSrc/components/base/text'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { RiImage } from 'uiSrc/components/base/display'
import { Spacer } from 'uiSrc/components/base/layout'
import { OAUTH_ADVANTAGES_ITEMS } from './constants'
import { Col } from 'uiSrc/components/base/layout/flex'

import * as S from '../../OAuth.styles'

const OAuthAdvantages = () => (
  <S.AdvantagesContainer data-testid="oauth-advantages">
    <RiImage src={RedisLogo} alt="Redis logo" $size="s" />
    <Title size="M">Cloud</Title>
    <Spacer size="space600" />
    <Col justify="between" align="stretch" grow={false} gap="m">
      {OAUTH_ADVANTAGES_ITEMS.map(({ title }) => (
        <S.Advantage as={Text} component="div" key={title?.toString()}>
          <S.AdvantageIcon>
            <RiIcon type="CheckThinIcon" />
          </S.AdvantageIcon>
          <Text size="S">{title}</Text>
        </S.Advantage>
      ))}
    </Col>
  </S.AdvantagesContainer>
)

export default OAuthAdvantages
