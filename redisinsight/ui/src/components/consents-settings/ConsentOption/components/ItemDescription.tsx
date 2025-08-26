import parse from 'html-react-parser'
import React from 'react'
import { Link } from 'uiSrc/components/base/link/Link'

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
          color="primary"
          target="_blank"
          href="https://redis.io/legal/privacy-policy/?utm_source=redisinsight&utm_medium=app&utm_campaign=telemetry"
        >
          Privacy Policy
        </Link>
        .
      </>
    )}
  </>
)
