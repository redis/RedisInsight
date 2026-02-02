import React from 'react'

import { SecondaryButton } from 'uiSrc/components/base/forms/buttons'
import { RiStopIcon } from 'uiSrc/components/base/icons'
import { RiTooltip } from 'uiSrc/components'
import { PipelineButtonProps } from '../reset-pipeline-button/ResetPipelineButton'
import * as S from '../Buttons.styles'

const StopPipelineButton = ({
  onClick,
  disabled,
  loading,
}: PipelineButtonProps) => (
  <RiTooltip content="Stop the pipeline to prevent processing of new data arrivals.">
    {disabled ? (
      <S.DisabledAnchor>
        <SecondaryButton
          aria-label="Stop running pipeline"
          loading={loading}
          disabled={disabled}
          icon={RiStopIcon}
          data-testid="stop-pipeline-btn"
          onClick={onClick}
        >
          Stop
        </SecondaryButton>
      </S.DisabledAnchor>
    ) : (
      <SecondaryButton
        aria-label="Stop running pipeline"
        loading={loading}
        disabled={disabled}
        icon={RiStopIcon}
        data-testid="stop-pipeline-btn"
        onClick={onClick}
      >
        Stop
      </SecondaryButton>
    )}
  </RiTooltip>
)

export default StopPipelineButton
