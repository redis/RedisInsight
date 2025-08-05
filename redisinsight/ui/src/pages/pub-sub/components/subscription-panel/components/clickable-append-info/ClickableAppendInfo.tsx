import React, { useState } from 'react'
import { getUtmExternalLink } from 'uiSrc/utils/links'
import { RiText } from 'uiSrc/components/base/text'
import {
  EXTERNAL_LINKS,
  UTM_CAMPAINGS,
  UTM_MEDIUMS,
} from 'uiSrc/constants/links'
import { RiIcon } from 'uiSrc/components/base/icons'
import { RiLink } from 'uiSrc/components/base/display'
import { RiPopover } from 'uiSrc/components/base'
import styles from './styles.module.scss'

const ClickableAppendInfo = () => {
  const [open, setOpen] = useState<boolean>(false)

  const onClick = () => {
    const newVal = !open
    setOpen(newVal)
  }

  return (
    <RiPopover
      id="showPupSubExamples"
      ownFocus={false}
      button={
        <RiIcon
          size="l"
          type="InfoIcon"
          style={{ cursor: 'pointer' }}
          onClick={onClick}
          data-testid="append-info-icon"
        />
      }
      isOpen={open}
      closePopover={() => setOpen(false)}
      panelClassName={styles.popover}
      anchorClassName={styles.infoIcon}
      panelPaddingSize="s"
      data-testid="pub-sub-examples"
    >
      <RiText color="subdued" size="s">
        Subscribe to one or more channels or patterns by entering them,
        separated by spaces.
        <br />
        Supported glob-style patterns are described&nbsp;
        <RiLink
          target="_blank"
          href={getUtmExternalLink(EXTERNAL_LINKS.pubSub, {
            medium: UTM_MEDIUMS.Main,
            campaign: UTM_CAMPAINGS.PubSub,
          })}
        >
          here.
        </RiLink>
      </RiText>
    </RiPopover>
  )
}

export default ClickableAppendInfo
