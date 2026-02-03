import React from 'react'
import { PipelineState, PipelineStatus } from 'uiSrc/slices/interfaces'
import { formatLongName } from 'uiSrc/utils'
import { Icon } from 'uiSrc/components/base/icons'
import { Title } from 'uiSrc/components/base/text/Title'
import { Loader } from 'uiSrc/components/base/display'
import { RiTooltip } from 'uiSrc/components'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { getStatusToShowFromState, getStatusToShowFromStatus } from './utils'

export interface Props {
  pipelineState?: PipelineState
  pipelineStatus?: PipelineStatus
  statusError?: string
  headerLoading: boolean
}

const CurrentPipelineStatus = ({
  pipelineState,
  pipelineStatus,
  statusError,
  headerLoading,
}: Props) => {
  const stateInfo = pipelineState
    ? getStatusToShowFromState(pipelineState)
    : getStatusToShowFromStatus(pipelineStatus)
  const errorTooltipContent = statusError && formatLongName(statusError)

  return (
    <Row align="center" gap="m">
      <FlexItem>
        <Title size="XS" color="primary">
          Pipeline status
        </Title>
      </FlexItem>
      <FlexItem>
        {headerLoading ? (
          <Loader size="m" style={{ marginLeft: '8px' }} />
        ) : (
          <RiTooltip
            content={errorTooltipContent}
            anchorClassName={statusError}
          >
            <Row data-testid="pipeline-status-badge" gap="s" align="center">
              <Icon icon={stateInfo.icon} color={stateInfo.iconColor} />
              <Text>{stateInfo.label}</Text>
            </Row>
          </RiTooltip>
        )}
      </FlexItem>
    </Row>
  )
}

export default CurrentPipelineStatus
