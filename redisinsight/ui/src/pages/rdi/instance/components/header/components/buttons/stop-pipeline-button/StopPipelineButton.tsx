import React from 'react'

import { RiSecondaryButton } from 'uiSrc/components/base/forms'
import { RiStopIcon } from 'uiSrc/components/base/icons'
import { RiTooltip } from 'uiSrc/components'
import { PipelineButtonProps } from '../reset-pipeline-button/ResetPipelineButton'
import styles from '../styles.module.scss'

const StopPipelineButton = ({
  onClick,
  disabled,
  loading,
}: PipelineButtonProps) => (
  <RiTooltip
    content="Stop the pipeline to prevent processing of new data arrivals."
    anchorClassName={disabled ? styles.disabled : undefined}
  >
    <RiSecondaryButton
      aria-label="Stop running pipeline"
      size="s"
      loading={loading}
      disabled={disabled}
      icon={RiStopIcon}
      data-testid="stop-pipeline-btn"
      onClick={onClick}
    >
      Stop Pipeline
    </RiSecondaryButton>
  </RiTooltip>
)

export default StopPipelineButton
