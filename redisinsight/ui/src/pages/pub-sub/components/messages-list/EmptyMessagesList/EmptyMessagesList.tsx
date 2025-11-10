import React from 'react'
import styled from 'styled-components'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import { Text, Title } from 'uiSrc/components/base/text'
import { Col, FlexItem } from 'uiSrc/components/base/layout/flex'
import { Banner } from 'uiSrc/components/base/display'
import { Spacer } from 'uiSrc/components/base/layout'
import { CallOut } from 'uiSrc/components/base/display/call-out/CallOut'
import LightBulbImage from 'uiSrc/assets/img/pub-sub/light-bulb.svg'

import SubscribeForm from '../../subscribe-form'
import { HeroImage } from './EmptyMessagesList.styles'

export interface Props {
  connectionType?: ConnectionType
  isSpublishNotSupported: boolean
}

const InnerContainer = styled(Col)`
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral300};
  border-radius: ${({ theme }) => theme.core.space.space100};
  border: 1px solid ${({ theme }) => theme.semantic.color.border.neutral500};
  padding: ${({ theme }) => theme.core.space.space300};
  height: 100%;
`

const Wrapper = styled(FlexItem)`
  margin: ${({ theme }) => theme.core.space.space500};
  height: 100%;
`

const EmptyMessagesList = ({
  connectionType,
  isSpublishNotSupported,
}: Props) => (
  <Wrapper>
    <InnerContainer
      align="center"
      justify="center"
      data-testid="empty-messages-list"
    >
      <HeroImage src={LightBulbImage} alt="Pub/Sub" />

      <Spacer size="space800" />

      <Title size="XXL">You are not subscribed</Title>

      <Spacer size="s" />

      <Text>
        Subscribe to the Channel to see all the messages published to your
        database
      </Text>

      <Spacer size="space800" />

      <SubscribeForm grow={false} />

      <Spacer size="space800" />

      <CallOut variant="attention">
        Running in production may decrease performance and memory available.
      </CallOut>

      {connectionType === ConnectionType.Cluster && isSpublishNotSupported && (
        <>
          <Spacer size="space200" />

          <Banner
            data-testid="empty-messages-list-cluster"
            variant="attention"
            showIcon={true}
            message="Messages published with SPUBLISH will not appear in this channel"
          />
        </>
      )}
    </InnerContainer>
  </Wrapper>
)

export default EmptyMessagesList
