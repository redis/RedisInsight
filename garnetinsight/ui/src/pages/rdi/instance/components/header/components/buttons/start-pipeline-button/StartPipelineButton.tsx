import React from 'react'

import { SecondaryButton } from 'uiSrc/components/base/forms/buttons'
import { PlayFilledIcon } from 'uiSrc/components/base/icons'
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
    <SecondaryButton
      aria-label="Start running pipeline"
      icon={PlayFilledIcon}
      data-testid="start-pipeline-btn"
      disabled={disabled}
      loading={loading}
      onClick={onClick}
    >
      Start
    </SecondaryButton>
  </RiTooltip>
)

export default StartPipelineButton
