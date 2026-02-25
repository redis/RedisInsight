import styled from 'styled-components'
import { HTMLAttributes } from 'react'
import { Row, FlexItem } from 'uiSrc/components/base/layout/flex'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const Container = styled(FlexItem)`
  @media only screen and (max-width: 1124px) {
    .modules {
      margin-left: 0;
      border-left: 0;
      padding-left: ${({ theme }: { theme: Theme }) =>
        theme.core.space.space150};
    }

    .overview {
      border-right: 0;
    }
  }
`

export const ItemContainer = styled(Row)`
  height: ${({ theme }: { theme: Theme }) => theme.core.space.space500};
  border-radius: ${({ theme }: { theme: Theme }) => theme.core.space.space100};
`

export const OverviewItem = styled(FlexItem)<{ className?: string }>`
  min-width: ${({ theme }: { theme: Theme }) => theme.core.space.space600};
  padding: 0 ${({ theme }: { theme: Theme }) => theme.core.space.space100} 0 0;
  color: ${({ theme }: { theme: Theme }) =>
    theme.components.typography.colors.secondary};

  &:not(:last-child) {
    border-right: 1px solid
      ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral500};
  }
`

export const Icon = styled.span`
  color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.icon.neutral600};
  margin-right: ${({ theme }: { theme: Theme }) => theme.core.space.space100};
  width: auto;
  height: ${({ theme }: { theme: Theme }) => theme.core.space.space150};
  max-width: ${({ theme }: { theme: Theme }) => theme.core.space.space200};
  display: flex;
  align-items: center;
`

export const OverviewItemContent = styled(FlexItem)`
  font-size: 14px;
  font-weight: 400;
`

export const CommandsPerSecTip = styled.div<HTMLAttributes<HTMLDivElement>>`
  margin-bottom: ${({ theme }: { theme: Theme }) => theme.core.space.space100};
  &:last-child {
    margin-bottom: 0;
  }
`

export const MoreInfoOverviewIcon = styled.span`
  margin-right: ${({ theme }: { theme: Theme }) => theme.core.space.space100};
  width: auto;
  max-width: ${({ theme }: { theme: Theme }) => theme.core.space.space250};
  height: ${({ theme }: { theme: Theme }) => theme.core.space.space200};
  display: flex;
  align-items: center;
`

export const MoreInfoOverviewContent = styled(Row)`
  margin-right: ${({ theme }: { theme: Theme }) => theme.core.space.space100};
  font-size: 12px;
`

export const MoreInfoOverviewTitle = styled(FlexItem)`
  margin-right: ${({ theme }: { theme: Theme }) => theme.core.space.space100};
  font-size: 12px;
  font-weight: 200;
`

export const AutoRefresh = styled(FlexItem)`
  padding-top: 0;
  padding-bottom: 0;
  margin-left: -${({ theme }: { theme: Theme }) => theme.core.space.space025};

  .popover-without-top-tail {
    margin-top: 0;
  }
`

export const UpgradeBtnItem = styled(FlexItem)`
  border-right: none;
  height: ${({ theme }: { theme: Theme }) => theme.core.space.space300};
`

export const UpgradeBtn = styled.span`
  padding: 0;
  margin-top: 0;
`
