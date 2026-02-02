import styled from 'styled-components'
import { Row, FlexItem } from 'uiSrc/components/base/layout/flex'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const Container = styled(Row)`
  margin: 0;

  @media only screen and (max-width: 1124px) {
    .modules {
      margin-left: 0;
      border-left: 0;
      padding-left: 12px;
    }

    .overview {
      border-right: 0;
    }
  }
`

export const ItemContainer = styled.div`
  display: flex;
  height: 42px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  margin-left: 6px;
`

export const OverviewItem = styled(FlexItem)<{ className?: string }>`
  min-width: 58px;
  padding: 0 14px;
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
  margin-right: 6px;
  width: auto;
  height: 14px;
  max-width: 18px;
  display: flex;
  align-items: center;
`

export const OverviewItemContent = styled(FlexItem)`
  font-size: 14px;
  font-weight: 400;
`

export const TOOLTIP_MAX_WIDTH = '372px'

export const CommandsPerSecTip = styled.div`
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`

export const MoreInfoOverviewIcon = styled.span`
  margin-right: 8px;
  width: auto;
  max-width: 20px;
  height: 18px;
  display: flex;
  align-items: center;
`

export const MoreInfoOverviewContent = styled(FlexItem)`
  flex-direction: row;
  margin-right: 6px;
  font-size: 12px;
`

export const MoreInfoOverviewTitle = styled(FlexItem)`
  margin-right: 6px;
  font-size: 12px;
  font-weight: 200;
`

export const AutoRefresh = styled(FlexItem)`
  padding-top: 0;
  padding-bottom: 0;
  margin-left: -2px;

  .popover-without-top-tail {
    margin-top: 0;
  }
`

export const UpgradeBtnItem = styled(FlexItem)`
  border-right: none;
  height: 28px;
`

export const UpgradeBtn = styled.span`
  padding: 0;
  margin-top: 0;
`

// OverviewMetrics styles
export const CpuWrapper = styled.div``

export const OpsPerSecItem = styled.div``

export const CalculationWrapper = styled.div`
  display: flex;
  align-items: center;
`

export const Spinner = styled.span``

export const Calculation = styled.span`
  font-style: italic;
`
