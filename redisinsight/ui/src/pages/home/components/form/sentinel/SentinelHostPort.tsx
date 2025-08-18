import React from 'react'

import { RiColorText, RiText } from 'uiBase/text'
import { RiIconButton } from 'uiBase/forms'
import { CopyIcon } from 'uiBase/icons'
import { RiTooltip } from 'uiSrc/components'
import styles from '../../styles.module.scss'

export interface Props {
  host: string
  port: string
}

const SentinelHostPort = (props: Props) => {
  const { host, port } = props

  const handleCopy = (text = '') => {
    navigator.clipboard.writeText(text)
  }

  return (
    <RiText color="subdued" className={styles.sentinelCollapsedField}>
      Sentinel Host & Port:
      <div className={styles.hostPort}>
        <RiColorText>{`${host}:${port}`}</RiColorText>
        <RiTooltip
          position="right"
          content="Copy"
          anchorClassName="copyHostPortTooltip"
        >
          <RiIconButton
            icon={CopyIcon}
            aria-label="Copy host:port"
            className={styles.copyHostPortBtn}
            onClick={() => handleCopy(`${host}:${port}`)}
          />
        </RiTooltip>
      </div>
    </RiText>
  )
}

export default SentinelHostPort
