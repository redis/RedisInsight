import React, { useState } from 'react'

import { Title } from 'uiSrc/components/base/text/Title'
import { Text } from 'uiSrc/components/base/text'
import { Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { InfoIcon } from 'uiSrc/components/base/icons'
import { RiPopover } from 'uiSrc/components/base'
import { Link } from 'uiSrc/components/base/link/Link'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import { getUtmExternalLink } from 'uiSrc/utils/links'

import * as S from './HeaderTitle.styles'

export const HeaderTitle = () => {
  const [isInfoPopoverOpen, setIsInfoPopoverOpen] = useState(false)

  return (
    <Row align="center" gap="xs">
      <Title size="M" color="primary" data-testid="vector-search--list--title">
        Search indexes
      </Title>
      <RiPopover
        anchorPosition="downCenter"
        isOpen={isInfoPopoverOpen}
        closePopover={() => setIsInfoPopoverOpen(false)}
        panelPaddingSize="l"
        button={
          <S.InfoIconWrapper
            data-testid="vector-search--list--info-icon"
            onClick={() => setIsInfoPopoverOpen((prev) => !prev)}
          >
            <InfoIcon />
          </S.InfoIconWrapper>
        }
      >
        <S.PopoverContent>
          <Text>
            A search index organizes your data to enable fast Vector, full-text,
            hybrid, and numeric searches in Redis.
          </Text>
          <Spacer size="s" />
          <Link
            href={getUtmExternalLink(EXTERNAL_LINKS.searchIndexes, {
              campaign: 'vector_search',
            })}
            target="_blank"
            variant="inline"
            external
            data-testid="vector-search--list--learn-more-link"
          >
            Learn more
          </Link>
        </S.PopoverContent>
      </RiPopover>
    </Row>
  )
}
