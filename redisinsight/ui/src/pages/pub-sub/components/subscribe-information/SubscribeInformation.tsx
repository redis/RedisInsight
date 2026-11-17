import React from 'react'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import { Trans, useTranslation } from 'uiSrc/i18n'
import { Text } from 'uiSrc/components/base/text'
import {
  EXTERNAL_LINKS,
  UTM_CAMPAINGS,
  UTM_MEDIUMS,
} from 'uiSrc/constants/links'
import { Link } from 'uiSrc/components/base/link/Link'
import { RiTooltip } from 'uiSrc/components/base'
import { Col } from 'uiSrc/components/base/layout/flex'
import { InfoIcon } from './SubscribeInformation.styles'

const SubscribeInformation = () => {
  const { t } = useTranslation()

  return (
    <RiTooltip
      interactive
      data-testid="pub-sub-examples"
      content={
        <Col gap="l">
          <Text>{t('pubsub.subscribe.info.channels')}</Text>

          <Text>
            <Trans
              i18nKey="pubsub.subscribe.info.patterns"
              components={{
                docsLink: (
                  <Link
                    variant="inline"
                    target="_blank"
                    href={getUtmExternalLink(EXTERNAL_LINKS.pubSub, {
                      medium: UTM_MEDIUMS.Main,
                      campaign: UTM_CAMPAINGS.PubSub,
                    })}
                  />
                ),
              }}
            />
          </Text>
        </Col>
      }
    >
      <InfoIcon />
    </RiTooltip>
  )
}

export default SubscribeInformation
