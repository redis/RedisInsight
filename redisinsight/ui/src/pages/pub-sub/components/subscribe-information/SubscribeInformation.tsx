import React from 'react'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import { Text } from 'uiSrc/components/base/text'
import {
  EXTERNAL_LINKS,
  UTM_CAMPAINGS,
  UTM_MEDIUMS,
} from 'uiSrc/constants/links'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { Link } from 'uiSrc/components/base/link/Link'
import { RiPopover } from 'uiSrc/components/base'
import { Col } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout'

const SubscribeInformation = () => (
  <RiPopover
    id="showPupSubExamples"
    button={
      <RiIcon
        size="l"
        type="InfoIcon"
        // TODO: Remove marginTop
        // Hack: for some reason this icon has extra height, which breaks flex alignment
        style={{ cursor: 'pointer', marginTop: 4 }}
        data-testid="append-info-icon"
      />
    }
    data-testid="pub-sub-examples"
  >
    <Col>
      <Text>
        Subscribe to one or more channels or patterns by entering them,
        separated by spaces.
      </Text>

      <Spacer />

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
  </RiPopover>
)

export default SubscribeInformation
