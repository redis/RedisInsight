import React, { useState } from 'react'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import { isNull } from 'lodash'
import { getRedirectionPage } from 'uiSrc/utils/routing'
import DatabaseNotOpened from 'uiSrc/components/messages/database-not-opened'

import { Link, RiLinkProps } from 'uiSrc/components/base/link'
import { RiPopover } from 'uiSrc/components/base'
import * as S from './RedisInsightLink.styles'

export interface Props {
  url: string
  text: string
  size?: RiLinkProps['size']
}

const RedisInsightLink = (props: Props) => {
  const { url, text, size } = props

  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const { instanceId } = useParams<{ instanceId: string }>()
  const history = useHistory()
  const location = useLocation()

  const handleLinkClick = (e: React.MouseEvent) => {
    e.preventDefault()

    const href = getRedirectionPage(url, instanceId, location.pathname)
    if (href) {
      history.push(href)
      return
    }

    if (isNull(href)) {
      setIsPopoverOpen(true)
    }
  }

  return (
    <RiPopover
      ownFocus
      panelClassName="popoverLikeTooltip"
      minWidth={S.POPOVER_MIN_WIDTH}
      anchorPosition="upLeft"
      isOpen={isPopoverOpen}
      panelPaddingSize="m"
      closePopover={() => setIsPopoverOpen(false)}
      button={
        <S.PopoverAnchor>
          <Link
            variant="inline"
            size={size}
            href="/"
            onClick={handleLinkClick}
            data-testid="redisinsight-link"
          >
            {text}
          </Link>
        </S.PopoverAnchor>
      }
    >
      <DatabaseNotOpened />
    </RiPopover>
  )
}

export default RedisInsightLink
