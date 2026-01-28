import styled, { css } from 'styled-components'
import { HTMLAttributes } from 'react'
import { Row } from 'uiSrc/components/base/layout/flex'

export const AnchorTooltipNode = styled.div<HTMLAttributes<HTMLDivElement>>`
  width: 100%;
  height: 42px;
  display: flex;
  position: relative;
  align-items: center;
`

export const NodeContainer = styled(AnchorTooltipNode)<{
  $isSelected?: boolean
  $isEven?: boolean
}>`
  border-left: 3px solid transparent;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) =>
      theme.semantic.color.background.neutral200};
  }

  ${({ $isEven }) =>
    $isEven &&
    css`
      background-color: ${({ theme }) =>
        theme.semantic.color.background.neutral100};
    `}

  ${({ $isSelected }) =>
    $isSelected &&
    css`
      border-left-color: ${({ theme }) =>
        theme.semantic.color.background.neutral200};
      background-color: ${({ theme }) =>
        theme.semantic.color.background.neutral200};
    `}
`

export const NodeContent = styled(Row)<{ $isOpen?: boolean }>`
  display: flex;
  justify-content: space-between;
  padding: ${({ theme }) => theme.core.space.space100}
    ${({ theme }) => theme.core.space.space200};
  align-items: center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  height: 100%;
  flex-grow: 1;

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
  margin-right: ${({ theme }) => theme.core.space.space075};
  width: 10px;
  height: 10px;

  svg {
    width: 10px;
    height: 10px;
  }
`

export const NodeIconLeaf = styled.span`
  margin-left: 25px;
  margin-bottom: 2px;
  width: 14px;
  height: 14px;

  svg {
    width: 14px;
    height: 14px;
  }
`

export const NodeIcon = styled.span`
  margin-right: ${({ theme }) => theme.core.space.space100};
`

export const Approximate = styled.span<HTMLAttributes<HTMLSpanElement>>`
  display: inline-block;
  width: 86px;
  min-width: 86px;
  text-align: right;
`

export const KeyCount = styled.span<HTMLAttributes<HTMLSpanElement>>`
  display: inline-block;
  width: 90px;
  min-width: 90px;
  text-align: right;
`

export const Options = styled.span`
  padding-left: ${({ theme }) => theme.core.space.space150};
  font-size: 12px;
  font-weight: 300;
`

export const KeyType = styled.div`
  padding-right: ${({ theme }) => theme.core.space.space200};
  padding-left: ${({ theme }) => theme.core.space.space150};
  width: 126px;
  min-width: 126px;
`

export const KeyName = styled.div`
  flex-grow: 1;
  position: relative;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const NodeName = styled.div`
  flex-grow: 1;
  position: relative;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const KeyTTL = styled.div`
  width: 86px;
  min-width: 86px;
  text-align: right;
`

export const KeySize = styled.div`
  width: 90px;
  min-width: 90px;
  text-align: right;
`

export const KeyInfoLoading = styled.div`
  margin-top: ${({ theme }) => theme.core.space.space100};
  padding-left: ${({ theme }) => theme.core.space.space200};
`

export const FolderTooltipHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  word-break: break-all;
`

export const Delimiters = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
`

export const FolderPattern = styled.span`
  font-weight: bold;
  margin-right: ${({ theme }) => theme.core.space.space050};
  white-space: normal;
`

export const Delimiter = styled.span<HTMLAttributes<HTMLSpanElement>>`
  margin-bottom: 2px;
  padding: 2px 5px;
  margin-right: ${({ theme }) => theme.core.space.space050};
  border-radius: 2px;
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral200};
`
