import styled from 'styled-components'
import React from 'react'
import { ColorText, Text } from 'uiSrc/components/base/text'
import { Theme } from 'uiSrc/components/base/theme/types'
import { getApproximatePercentage, Maybe } from 'uiSrc/utils'
import { isUndefined } from 'lodash'
import { isProcessedBulkAction } from 'uiSrc/pages/browser/components/bulk-actions/utils'
import { CallOut } from 'uiSrc/components/base/display/call-out/CallOut'
import { BulkActionsStatus } from 'uiSrc/constants'
import { Props } from './BulkActionsInfo'

export const BulkActionsInfoFilter = styled.div<{
  className?: string
  children?: React.ReactNode
}>`
  display: inline-flex;
  gap: ${({ theme }) => theme.core.space.space050};
  align-items: center;
  font-size: ${({ theme }) => theme.core.font.fontSize.s12};
`

export const BulkActionsTitle = styled(Text).attrs({
  size: 'M',
})<React.ComponentProps<typeof Text> & { $full?: boolean }>`
  color: ${({ theme, color }) =>
    !color && theme.semantic.color.text.informative400};
  ${({ $full }) => $full && 'width: 100%'}
`

export const BulkActionsInfoSearch = styled(ColorText).attrs({
  size: 'M',
})`
  word-break: break-all;
`

export const BulkActionsProgress = styled(CallOut)``

export const BulkActionsProgressLine = styled.div<{
  children?: React.ReactNode
}>`
  height: 2px;
  width: calc(100% - 24px);
  margin-top: -1px;
  & > div {
    height: 100%;
    background-color: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.background.informative300};
  }
`

export const BulkActionsContainer = styled.div<{ children: React.ReactNode }>`
  position: relative;
  border-radius: ${({ theme }: { theme: Theme }) => theme.core.space.space050};
  min-height: 162px;
  padding: ${({ theme }: { theme: Theme }) => theme.core.space.space200};
  gap: ${({ theme }: { theme: Theme }) => theme.core.space.space300};
  display: flex;
  flex-direction: column;
`

export const BulkActionsStatusDisplay = ({
  status,
  total,
  scanned,
}: {
  status: Props['status']
  total: Maybe<number>
  scanned: Maybe<number>
}) => {
  if (!isUndefined(status) && !isProcessedBulkAction(status)) {
    return (
      <BulkActionsProgress data-testid="bulk-status-progress">
        In progress:
        <ColorText size="XS">{` ${getApproximatePercentage(total, scanned)}`}</ColorText>
      </BulkActionsProgress>
    )
  }
  if (status === BulkActionsStatus.Aborted) {
    return (
      <BulkActionsProgress variant="danger" data-testid="bulk-status-stopped">
        Stopped: {getApproximatePercentage(total, scanned)}
      </BulkActionsProgress>
    )
  }

  if (status === BulkActionsStatus.Completed) {
    return (
      <BulkActionsProgress
        showIcon
        variant="success"
        data-testid="bulk-status-completed"
      >
        Action completed
      </BulkActionsProgress>
    )
  }
  if (status === BulkActionsStatus.Disconnected) {
    return (
      <BulkActionsProgress
        variant="danger"
        data-testid="bulk-status-disconnected"
      >
        Connection Lost: {getApproximatePercentage(total, scanned)}
      </BulkActionsProgress>
    )
  }
  return null
}
