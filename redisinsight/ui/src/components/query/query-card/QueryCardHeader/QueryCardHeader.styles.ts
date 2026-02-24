import { type HTMLAttributes } from 'react'
import styled, { css } from 'styled-components'
import { Row, FlexItem } from 'uiSrc/components/base/layout/flex'
import { RiSelect } from 'uiSrc/components/base/forms/select/RiSelect'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const ProfileSelect = styled(RiSelect)`
  border: none;
  background-color: inherit;
  width: 46px;
  padding: inherit;

  &.profiler {
    min-width: 50px;
  }

  &.toggle-view {
    min-width: 40px;
  }

  & ~ div {
    right: 0;

    svg {
      width: 10px;
      height: 10px;
    }
  }
`

export const Container = styled(Row)<{ $notExpanded?: boolean }>`
  height: 45px;
  padding: 0 20px;
  cursor: pointer;

  .copy-btn {
    margin-left: 5px;

    @media (min-width: 1050px) {
      margin-left: 10px;
    }
  }

  ${({ $notExpanded }) =>
    $notExpanded &&
    css`
      cursor: default;
    `}
`

export const Title = styled.div`
  display: inline-block;
  font:
    normal normal normal 13px/17px Graphik,
    sans-serif;
  letter-spacing: -0.13px;
  overflow: hidden;

  .euiToolTipAnchor {
    display: inline-block;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    position: relative;
    max-width: 100%;
    vertical-align: middle;
  }
`

export const Time = styled(FlexItem)`
  max-width: 134px;
`

export const Mode = styled.span`
  & + & {
    margin-left: 18px;
  }
`

export const SummaryTextWrapper = styled(FlexItem)`
  min-width: 86px;
`

export const ChangeViewWrapper = styled.div`
  display: flex;
`

export const TooltipIcon = styled.div`
  display: flex;
  flex: 1;
`

export const ExecutionTime = styled(FlexItem)`
  min-width: 13px;
  width: 13px;

  @media (min-width: 1050px) {
    min-width: 92px;
    width: 92px;
  }
`

export const ExecutionTimeValue = styled.span`
  display: none;

  @media (min-width: 1050px) {
    display: initial;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    white-space: nowrap;
    cursor: pointer;
  }
`

export const DropdownOption = styled.div<HTMLAttributes<HTMLDivElement>>`
  display: flex;
  align-items: center;
  position: relative;
  padding: 0 0 3px 8px;

  span {
    font-size: 14px;
    margin-left: 5px;
    line-height: 20px;
    overflow: hidden;
    max-width: 200px;
  }
`

export const DropdownProfileOption = styled(DropdownOption)`
  display: inherit;
`

export const TitleWrapper = styled(FlexItem)`
  justify-content: center;
  min-height: 24px;
  overflow: hidden;

  .copy-btn {
    margin-top: 2px;
    margin-left: 12px;
  }
`

export const Controls = styled(FlexItem)`
  flex-shrink: 0;
`

export const Separator = styled.span`
  height: 1px;
  width: 100%;
  background: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.border.neutral300};
  display: block;
  opacity: 0.5;
`

export const ButtonIcon = styled(FlexItem)`
  padding: 0 4px;
  min-width: 32px;
  position: relative;
  z-index: 2;
`

export const ViewTypeIcon = styled(ButtonIcon)`
  width: 54px;
  min-width: 54px;
  margin: 0 4px;
`

export const PlayIcon = styled(ButtonIcon)`
  margin-right: 4px;
`

export const TooltipAnchor = styled.span`
  width: 16px;
  margin-left: -${({ theme }: { theme: Theme }) => theme.core.space.space025};
  cursor: pointer;

  .fullscreen & {
    margin-left: 0;
  }
`
