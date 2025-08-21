import styled from 'styled-components'
import React from 'react'
import { ColorText, Text } from 'uiSrc/components/base/text'
import { Theme } from 'uiSrc/components/base/theme/types'
import { getApproximatePercentage, Maybe } from 'uiSrc/utils'
import { isUndefined } from 'lodash'
import { isProcessedBulkAction } from 'uiSrc/pages/browser/components/bulk-actions/utils'
import { BulkActionsStatus } from 'uiSrc/constants'
import { Props } from './BulkActionsInfo'

export const BulkActionsInfoFilter = styled.div<{
  className?: string
  children?: React.ReactNode
}>`
  display: inline-flex;
  gap: ${({ theme }) => theme.core.space.space050};
  align-items: center;
  font-size: ${({ theme }) => theme.core.font.fontSize.s10};
`

export const BulkActionsTitle = styled(Text).attrs({
  size: 'XS',
})<React.ComponentProps<typeof Text> & { $full?: boolean }>`
  color: ${({ theme, color }) =>
    !color && theme.semantic.color.text.informative400};
  ${({ $full }) => $full && 'width: 100%'}
`

export const BulkActionsInfoSearch = styled(ColorText).attrs({
  size: 'XS',
})`
  word-break: break-all;
`

export const BulkActionsProgress = styled(BulkActionsTitle)<{
  $completed?: boolean
}>`
  position: absolute;
  right: 12px;
  top: 12px;
`
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
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral400};
  border-radius: ${({ theme }: { theme: Theme }) => theme.core.space.space050};
  margin: 18px;
  padding: 12px;
  min-height: 162px;
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
      <BulkActionsProgress
        size="XS"
        color="subdued"
        data-testid="bulk-status-progress"
      >
        In progress:
        <ColorText
          color="subdued"
          size="XS"
        >{` ${getApproximatePercentage(total, scanned)}`}</ColorText>
      </BulkActionsProgress>
    )
  }
  if (status === BulkActionsStatus.Aborted) {
    return (
      <BulkActionsProgress color="danger" data-testid="bulk-status-stopped">
        Stopped: {getApproximatePercentage(total, scanned)}
      </BulkActionsProgress>
    )
  }

  if (status === BulkActionsStatus.Completed) {
    return (
      <BulkActionsProgress color="success" data-testid="bulk-status-completed">
        Action completed
      </BulkActionsProgress>
    )
  }
  if (status === BulkActionsStatus.Disconnected) {
    return (
      <BulkActionsProgress
        color="danger"
        data-testid="bulk-status-disconnected"
      >
        Connection Lost: {getApproximatePercentage(total, scanned)}
      </BulkActionsProgress>
    )
  }
  return null
}
