import React from 'react'

import { SecondaryButton } from 'uiSrc/components/base/forms/buttons'
import { PlayFilledIcon } from 'uiSrc/components/base/icons'
import { RiTooltip } from 'uiSrc/components'
import { PipelineButtonProps } from '../reset-pipeline-button/ResetPipelineButton'
import * as S from '../Buttons.styles'

const StartPipelineButton = ({
  onClick,
  disabled,
  loading,
}: PipelineButtonProps) => (
  <RiTooltip content="Start the pipeline to resume processing new data arrivals.">
    {disabled ? (
      <S.DisabledAnchor>
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
      </S.DisabledAnchor>
    ) : (
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
    )}
  </RiTooltip>
)

export default StartPipelineButton
