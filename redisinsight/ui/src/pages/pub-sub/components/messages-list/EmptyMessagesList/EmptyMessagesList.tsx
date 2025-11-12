import React from 'react'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import { Text, Title } from 'uiSrc/components/base/text'
import { Col } from 'uiSrc/components/base/layout/flex'
import { Banner } from 'uiSrc/components/base/display'
import { CallOut } from 'uiSrc/components/base/display/call-out/CallOut'
import LightBulbImage from 'uiSrc/assets/img/pub-sub/light-bulb.svg'

import SubscribeForm from '../../subscribe-form'
import { HeroImage, InnerContainer, Wrapper } from './EmptyMessagesList.styles'

export interface Props {
  connectionType?: ConnectionType
  isSpublishNotSupported: boolean
}

const EmptyMessagesList = ({
  connectionType,
  isSpublishNotSupported,
}: Props) => (
  <Wrapper>
    <InnerContainer
      align="center"
      justify="center"
      data-testid="empty-messages-list"
      gap="xxl"
    >
      <HeroImage src={LightBulbImage} alt="Pub/Sub" />

      <Col align="center" justify="center" grow={false} gap="s">
        <Title size="XXL">You are not subscribed</Title>

        <Text>
          Subscribe to the Channel to see all the messages published to your
          database
        </Text>
      </Col>

      <SubscribeForm grow={false} />

      <CallOut variant="attention">
        Running in production may decrease performance and memory available.
      </CallOut>

      {connectionType === ConnectionType.Cluster && isSpublishNotSupported && (
        <>
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
