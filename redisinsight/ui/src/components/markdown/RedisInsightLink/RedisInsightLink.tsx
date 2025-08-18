import React, { useState } from 'react'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import cx from 'classnames'
import { isNull } from 'lodash'
import { RiLink, RiPopover } from 'uiBase/display'
import { getRedirectionPage } from 'uiSrc/utils/routing'
import DatabaseNotOpened from 'uiSrc/components/messages/database-not-opened'

import styles from './styles.module.scss'

export interface Props {
  url: string
  text: string
}

const RedisInsightLink = (props: Props) => {
  const { url, text } = props

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
      panelClassName={cx('popoverLikeTooltip', styles.popover)}
      anchorClassName={styles.popoverAnchor}
      anchorPosition="upLeft"
      isOpen={isPopoverOpen}
      panelPaddingSize="m"
      closePopover={() => setIsPopoverOpen(false)}
      button={
        <RiLink
          color="text"
          href="/"
          onClick={handleLinkClick}
          className={styles.link}
          data-testid="redisinsight-link"
        >
          {text}
        </RiLink>
      }
    >
      <DatabaseNotOpened />
    </RiPopover>
  )
}

export default RedisInsightLink
