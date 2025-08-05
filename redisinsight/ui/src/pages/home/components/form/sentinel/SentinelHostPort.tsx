import React from 'react'

import { RiTooltip } from 'uiSrc/components'
import { ColorText, Text } from 'uiSrc/components/base/text'
import { RiIconButton } from 'uiSrc/components/base/forms'
import { CopyIcon } from 'uiSrc/components/base/icons'
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
    <Text color="subdued" className={styles.sentinelCollapsedField}>
      Sentinel Host & Port:
      <div className={styles.hostPort}>
        <ColorText>{`${host}:${port}`}</ColorText>
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
    </Text>
  )
}

export default SentinelHostPort
