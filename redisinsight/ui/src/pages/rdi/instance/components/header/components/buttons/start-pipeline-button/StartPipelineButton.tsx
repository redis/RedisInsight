import React from 'react'

import { RiSecondaryButton } from 'uiBase/forms'
import { PlayFilledIcon } from 'uiBase/icons'
import { RiTooltip } from 'uiSrc/components'
import { PipelineButtonProps } from '../reset-pipeline-button/ResetPipelineButton'
import styles from '../styles.module.scss'

const StartPipelineButton = ({
  onClick,
  disabled,
  loading,
}: PipelineButtonProps) => (
  <RiTooltip
    content="Start the pipeline to resume processing new data arrivals."
    anchorClassName={disabled ? styles.disabled : styles.tooltip}
  >
    <RiSecondaryButton
      aria-label="Start running pipeline"
      size="s"
      icon={PlayFilledIcon}
      data-testid="start-pipeline-btn"
      disabled={disabled}
      loading={loading}
      onClick={onClick}
    >
      Start Pipeline
    </RiSecondaryButton>
  </RiTooltip>
)

export default StartPipelineButton
