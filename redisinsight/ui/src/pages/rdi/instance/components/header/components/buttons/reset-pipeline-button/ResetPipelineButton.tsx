import React from 'react'

import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { RiTooltip } from 'uiSrc/components'
import { Button, TextButton } from '@redis-ui/components'
import { ResetIcon } from '@redis-ui/icons'
import * as S from '../Buttons.styles'

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
  >
    {disabled || loading ? (
      <S.DisabledAnchor>
        <TextButton
          aria-label="Reset pipeline button"
          data-testid="reset-pipeline-btn"
          onClick={onClick}
          disabled={disabled}
        >
          <Button.Icon icon={ResetIcon} />
          Reset
        </TextButton>
      </S.DisabledAnchor>
    ) : (
      <TextButton
        aria-label="Reset pipeline button"
        data-testid="reset-pipeline-btn"
        onClick={onClick}
        disabled={disabled}
      >
        <Button.Icon icon={ResetIcon} />
        Reset
      </TextButton>
    )}
  </RiTooltip>
)

export default ResetPipelineButton
