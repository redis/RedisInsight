import React from 'react'
import { getUtmExternalLink } from 'uiSrc/utils/links'
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

const SubscribeInformation = () => (
  <RiTooltip
    interactive
    data-testid="pub-sub-examples"
    content={
      <Col gap="l">
        <Text>
          Subscribe to one or more channels or patterns by entering them,
          separated by spaces.
        </Text>

        <Text>
          Supported glob-style patterns are described&nbsp;
          <Link
            variant="inline"
            target="_blank"
            href={getUtmExternalLink(EXTERNAL_LINKS.pubSub, {
              medium: UTM_MEDIUMS.Main,
              campaign: UTM_CAMPAINGS.PubSub,
            })}
          >
            here.
          </Link>
        </Text>
      </Col>
    }
  >
    <InfoIcon />
  </RiTooltip>
)

export default SubscribeInformation
