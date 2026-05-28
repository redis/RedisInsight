import React from 'react'

import { Link } from 'uiSrc/components/base/link/Link'

export const AclTip = () => (
  <>
    <strong>Tip:</strong> Prevent accidental dangerous operations by restricting
    commands per user with{' '}
    <Link
      color="subdued"
      target="_blank"
      variant="inline"
      size="S"
      href="https://redis.io/docs/management/security/acl/"
    >
      Redis ACLs
    </Link>
    .
  </>
)
