import styled, { css } from 'styled-components'
import { HTMLAttributes } from 'react'
import { Row } from 'uiSrc/components/base/layout/flex'
import { ColorText } from 'uiSrc/components/base/text'

export const AnchorTooltipNode = styled(Row)`
  .tooltip-anchor {
    display: inline-block;
    width: 100%;
    height: 42px;
    position: relative;
  }
`

export const AnchorContent = styled(Row)`
  height: 100%;
`

export const NodeContainer = styled(AnchorTooltipNode)<{
  $isSelected?: boolean
  $isEven?: boolean
}>`
  border-left: 3px solid transparent;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) =>
      theme.semantic.color.background.neutral400};
  }

  ${({ $isEven }) =>
    $isEven &&
    css`
      background-color: ${({ theme }) =>
        theme.semantic.color.background.neutral300};
    `}

  ${({ $isSelected }) =>
    $isSelected &&
    css`
      border-left-color: ${({ theme }) =>
        theme.semantic.color.background.neutral200};
      background-color: ${({ theme }) =>
        theme.semantic.color.background.neutral400};
    `}
`

export const NodeContent = styled(Row)<{
  $isOpen?: boolean
  $isLeaf?: boolean
}>`
  padding: ${({ theme }) =>
    `${theme.core.space.space100} ${theme.core.space.space200}`};
  ${({ theme }) => theme.core.space.space200};
  letter-spacing: -0.13px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  height: 100%;

  .moveOnHoverKey {
    transition: transform ease 0.3s;
    &.hide {
      transform: translateX(-8px);
    }
  }

  .showOnHoverKey {
    display: none;
    &.show {
      display: flex;
    }
  }

  &:hover {
    .moveOnHoverKey {
      transform: translateX(-8px);
    }
    .showOnHoverKey {
      display: flex;
    }
  }
`

export const NodeIconArrow = styled.span`
  margin-left: ${({ theme }) => theme.core.space.space100};
  margin-right: ${({ theme }) => theme.core.space.space050};
  display: inline-block;
`

export const NodeIcon = styled.span`
  margin-right: ${({ theme }) => theme.core.space.space100};
`

export const NodeText = styled(ColorText)`
  display: inline-block;
  text-align: right;
`
export const Approximate = styled(NodeText)`
  width: 86px;
  min-width: 86px;
`

export const KeyCount = styled(NodeText)`
  width: 90px;
  min-width: 90px;
`

export const FolderTooltipHeader = styled(Row)`
  word-break: break-all;
`

export const Delimiters = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
`

export const Delimiter = styled.span<HTMLAttributes<HTMLSpanElement>>`
  margin-bottom: 2px;
  padding: 2px 5px;
  margin-right: ${({ theme }) => theme.core.space.space050};
  border-radius: 2px;
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral200};
`
