import React from 'react'
import { useTranslation } from 'uiSrc/i18n'
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
}: Props) => {
  const { t } = useTranslation()

  return (
    <Wrapper>
      <InnerContainer
        align="center"
        justify="center"
        data-testid="empty-messages-list"
        gap="xxl"
      >
        <HeroImage src={LightBulbImage} alt={t('pubsub.empty.imageAlt')} />

        <Col align="center" justify="center" grow={false} gap="s">
          <Title size="XXL">{t('pubsub.empty.title')}</Title>

          <Text>{t('pubsub.empty.description')}</Text>
        </Col>

        <SubscribeForm grow={false} />

        <CallOut variant="attention">
          {t('pubsub.empty.productionWarning')}
        </CallOut>

        {connectionType === ConnectionType.Cluster &&
          isSpublishNotSupported && (
            <>
              <Banner
                data-testid="empty-messages-list-cluster"
                variant="attention"
                showIcon={true}
                message={t('pubsub.empty.spublishWarning')}
              />
            </>
          )}
      </InnerContainer>
    </Wrapper>
  )
}

export default EmptyMessagesList
