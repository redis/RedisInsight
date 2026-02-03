import React from 'react'
import { RiIcon } from 'uiSrc/components/base/icons'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import { EXTERNAL_LINKS, UTM_MEDIUMS } from 'uiSrc/constants/links'
import { StyledFooter, FooterLink, FooterLinks } from './Footer.styles'

export interface FooterLinkItem {
  title: string
  href: string
}

const VECTOR_SEARCH_ONBOARDING_FOOTER_LINKS: FooterLinkItem[] = [
  {
    title: 'Redis for AI',
    href: getUtmExternalLink(EXTERNAL_LINKS.redisForAI, {
      medium: UTM_MEDIUMS.VectorSearchOnboarding,
      campaign: 'cloud',
    }),
  },
  {
    title: 'Quick start guide',
    href: getUtmExternalLink(EXTERNAL_LINKS.vectorDatabaseGettingStarted, {
      medium: UTM_MEDIUMS.VectorSearchOnboarding,
      campaign: 'cloud',
    }),
  },
  {
    title: 'Redis Sandbox',
    href: getUtmExternalLink(EXTERNAL_LINKS.redisSandbox, {
      medium: UTM_MEDIUMS.VectorSearchOnboarding,
      campaign: 'cloud',
    }),
  },
]

const Footer: React.FC = () => (
  <StyledFooter grow={false} data-testid="vector-search-onboarding--footer">
    <FooterLinks>
      {VECTOR_SEARCH_ONBOARDING_FOOTER_LINKS.map((item, index) => (
        <React.Fragment key={item.title}>
          <FooterLink href={item.href}>
            {item.title} <RiIcon type={'NewTabIcon'} size="M" />
          </FooterLink>

          {index !== VECTOR_SEARCH_ONBOARDING_FOOTER_LINKS.length - 1 && (
            <span>|</span>
          )}
        </React.Fragment>
      ))}
    </FooterLinks>
  </StyledFooter>
)

export default Footer
