import parse from 'html-react-parser'
import React from 'react'
import { Link } from 'uiSrc/components/base/link/Link'
import { EXTERNAL_LINKS, UTM_MEDIUMS } from 'uiSrc/constants/links'
import { getUtmExternalLink } from 'uiSrc/utils/links'

interface ItemDescriptionProps {
  description: string
  withLink: boolean
}

export const ItemDescription = ({
  description,
  withLink,
}: ItemDescriptionProps) => (
  <>
    {description && parse(description)}
    {withLink && (
      <>
        <Link
          variant="inline"
          target="_blank"
          color="secondary"
          size="S"
          href={getUtmExternalLink(EXTERNAL_LINKS.legalPrivacyPolicy, {
            medium: UTM_MEDIUMS.App,
            campaign: 'telemetry',
          })}
        >
          Privacy Policy
        </Link>
        .
      </>
    )}
  </>
)
