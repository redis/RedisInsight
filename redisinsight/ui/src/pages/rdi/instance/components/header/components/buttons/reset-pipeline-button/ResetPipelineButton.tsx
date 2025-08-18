import React from 'react'

import { RiResetIcon } from 'uiBase/icons'
import { RiSecondaryButton } from 'uiBase/forms'
import { RiSpacer } from 'uiBase/layout'
import { RiTooltip } from 'uiBase/display'

import styles from '../styles.module.scss'

export interface PipelineButtonProps {
  onClick: () => void
  disabled: boolean
  loading: boolean
}

const ResetPipelineButton = ({
  onClick,
  disabled,
  loading,
}: PipelineButtonProps) => (
  <RiTooltip
    content={
      !(disabled || loading) ? (
        <>
          <p>
            The pipeline will take a new snapshot of the data and process it,
            then continue tracking changes.
          </p>
          <RiSpacer size="m" />
          <p>
            Before resetting the RDI pipeline, consider stopping the pipeline
            and flushing the target Redis database.
          </p>
        </>
      ) : null
    }
    anchorClassName={disabled || loading ? styles.disabled : styles.tooltip}
  >
    <RiSecondaryButton
      aria-label="Reset pipeline button"
      size="s"
      icon={RiResetIcon}
      data-testid="reset-pipeline-btn"
      onClick={onClick}
      disabled={disabled}
      loading={loading}
    >
      Reset Pipeline
    </RiSecondaryButton>
  </RiTooltip>
)

export default ResetPipelineButton
