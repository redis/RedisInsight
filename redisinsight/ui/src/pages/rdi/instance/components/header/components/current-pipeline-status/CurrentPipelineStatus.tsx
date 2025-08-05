import React from 'react'
import { PipelineState } from 'uiSrc/slices/interfaces'
import { formatLongName, Maybe } from 'uiSrc/utils'
import { AllIconsType, RiIcon, IconProps } from 'uiSrc/components/base/icons'
import { RiTitle } from 'uiSrc/components/base/text'
import { RiLoader } from 'uiSrc/components/base/display'
import { RiTooltip } from 'uiSrc/components'
import styles from './styles.module.scss'

export interface Props {
  pipelineState?: PipelineState
  statusError?: string
  headerLoading: boolean
}

const CurrentPipelineStatus = ({
  pipelineState,
  statusError,
  headerLoading,
}: Props) => {
  const getPipelineStateIconAndLabel = (
    pipelineState: Maybe<PipelineState>,
  ): {
    label: string
    icon: AllIconsType
    iconColor: IconProps['color']
  } => {
    switch (pipelineState) {
      case PipelineState.InitialSync:
        return {
          icon: 'IndicatorSyncingIcon',
          iconColor: 'success300',
          label: 'Initial sync',
        }
      case PipelineState.CDC:
        return {
          icon: 'IndicatorSyncedIcon',
          iconColor: 'success300',
          label: 'Streaming',
        }
      case PipelineState.NotRunning:
        return {
          icon: 'IndicatorXIcon',
          iconColor: 'attention500',
          label: 'Not running',
        }
      default:
        return {
          icon: 'IndicatorErrorIcon',
          iconColor: 'danger500',
          label: 'Error',
        }
    }
  }
  const stateInfo = getPipelineStateIconAndLabel(pipelineState)
  const errorTooltipContent = statusError && formatLongName(statusError)

  return (
    <div className={styles.stateWrapper}>
      <RiTitle size="XS">Pipeline State:</RiTitle>
      {headerLoading ? (
        <RiLoader size="m" style={{ marginLeft: '8px' }} />
      ) : (
        <RiTooltip
          content={errorTooltipContent}
          anchorClassName={statusError && styles.tooltip}
        >
          <div className={styles.stateBadge} data-testid="pipeline-state-badge">
            <RiIcon type={stateInfo.icon} color={stateInfo.iconColor} />
            <span>{stateInfo.label}</span>
          </div>
        </RiTooltip>
      )}
    </div>
  )
}

export default CurrentPipelineStatus
