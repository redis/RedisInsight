import React from 'react'

import { Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { Text } from 'uiSrc/components/base/text'
import { Link } from 'uiSrc/components/base/link/Link'
import { RiBadge } from 'uiSrc/components/base/display/badge/RiBadge'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { AllIconsType } from 'uiSrc/components/base/icons'
import { WhatsNewCard } from 'uiSrc/constants/content/whatsNew.types'
import * as S from './FeatureCard.styles'

export interface Props {
  card: WhatsNewCard
  onLinkClick: (cardId: string, href: string) => void
}

const FeatureCard = ({ card, onLinkClick }: Props) => {
  const { id, title, body, tag, icon, location, links } = card

  return (
    <S.CardContainer data-testid={`whats-new-card-${id}`}>
      <S.CardHeader align="center">
        {icon && <RiIcon type={icon as AllIconsType} size="l" />}
        <Text size="m">{title}</Text>
        {tag && (
          <RiBadge label={tag} data-testid={`whats-new-card-tag-${id}`} />
        )}
      </S.CardHeader>

      <Spacer size="s" />

      <Text size="s" color="secondary">
        {body}
      </Text>

      {location && (
        <>
          <Spacer size="s" />
          <S.Location size="xs" data-testid={`whats-new-card-location-${id}`}>
            <strong>Where to find it:</strong> {location}
          </S.Location>
        </>
      )}

      {!!links?.length && (
        <>
          <Spacer size="s" />
          <Row gap="l" align="center">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                target="_blank"
                onClick={() => onLinkClick(id, link.href)}
                data-testid={`whats-new-card-link-${id}`}
              >
                {link.label}
              </Link>
            ))}
          </Row>
        </>
      )}
    </S.CardContainer>
  )
}

export default FeatureCard
