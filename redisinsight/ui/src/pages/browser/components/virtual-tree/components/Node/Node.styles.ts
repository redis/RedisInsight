import styled, { css } from 'styled-components'
import { Row } from 'uiSrc/components/base/layout/flex'

export const NodeContainer = styled.div<
  React.HTMLAttributes<HTMLDivElement> & {
    $isSelected?: boolean
    $isEven?: boolean
  }
>`
  border-left: 3px solid transparent;

  &:hover {
    background-color: ${({ theme }) =>
      theme.semantic.color.background.primary200};
  }

  ${({ $isEven, $isSelected, theme }) =>
    $isEven &&
    !$isSelected &&
    css`
      background-color: ${theme.semantic.color.background.neutral200};
    `}

  ${({ $isSelected, theme }) =>
    $isSelected &&
    css`
      border-left-color: ${theme.semantic.color.background.primary200};
      background-color: ${theme.semantic.color.background.primary200};
    `}
`

export const FOLDER_ANCHOR_CLASS = 'node-folder-anchor'

export const NodeContent = styled(Row).attrs({
  align: 'center',
  justify: 'between',
  gap: 'l',
})`
  height: 100%;
  cursor: pointer;
  padding: ${({ theme }) =>
    `${theme.core.space.space100} ${theme.core.space.space200}`};
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  .${FOLDER_ANCHOR_CLASS} {
    flex: 1;
    display: flex;
    align-items: center;
    min-width: 0;
  }

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

export const FolderContent = styled(Row)`
  width: 100%;
  height: 42px;
  position: relative;
`

export const NodeIcon = styled.span<React.HTMLAttributes<HTMLSpanElement>>`
  margin-right: ${({ theme }) => theme.core.space.space100};
  display: inline-flex;
`

export const NodeIconArrow = styled.span<React.HTMLAttributes<HTMLSpanElement>>`
  margin-left: ${({ theme }) => theme.core.space.space100};
  margin-right: ${({ theme }) => theme.core.space.space050};
  display: inline-flex;

  svg {
    width: ${({ theme }) => theme.core.space.space150};
    height: ${({ theme }) => theme.core.space.space150};
  }
`

export const FolderTooltipHeader = styled(Row).attrs({
  align: 'center',
  justify: 'between',
  gap: 'l',
})`
  flex-wrap: wrap;
  word-break: break-all;
`

export const FolderPattern = styled.span<React.HTMLAttributes<HTMLSpanElement>>`
  font-weight: bold;
  margin-right: ${({ theme }) => theme.core.space.space050};
  white-space: normal;
`

export const Delimiters = styled.span<React.HTMLAttributes<HTMLSpanElement>>`
  display: inline-flex;
  flex-wrap: wrap;
`

export const Delimiter = styled.span<React.HTMLAttributes<HTMLSpanElement>>`
  margin-bottom: ${({ theme }) => theme.core.space.space025};
  padding: ${({ theme }) =>
    `${theme.core.space.space025} ${theme.core.space.space050}`};
  margin-right: ${({ theme }) => theme.core.space.space050};
  border-radius: ${({ theme }) => theme.core.space.space025};
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral200};
`

export const FolderApproximate = styled.div<
  React.HTMLAttributes<HTMLDivElement>
>`
  display: inline-block;
  width: 86px;
  min-width: 86px;
  text-align: right;
  transition: transform ease 0.3s;
`

export const FolderKeyCount = styled.div<React.HTMLAttributes<HTMLDivElement>>`
  display: inline-block;
  width: 90px;
  min-width: 90px;
  text-align: right;
  transition: transform ease 0.3s;
`

export const FolderActions = styled(Row)`
  &:hover {
    ${FolderApproximate},
    ${FolderKeyCount} {
      transform: translateX(-8px);
    }
  }
`
