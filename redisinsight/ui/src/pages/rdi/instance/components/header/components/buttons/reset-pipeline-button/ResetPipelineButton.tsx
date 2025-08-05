import React from 'react'

import { RiResetIcon } from 'uiSrc/components/base/icons'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { RiSecondaryButton } from 'uiSrc/components/base/forms'
import { RiTooltip } from 'uiSrc/components'
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
          <Spacer size="m" />
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
