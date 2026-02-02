import styled, { css, keyframes } from 'styled-components'
import { Table as VirtualizedTable } from 'react-virtualized'
import { type Theme } from 'uiSrc/components/base/theme/types'

const HEADER_HEIGHT = '44px'
const FOOTER_HEIGHT = '38px'

const dots = keyframes`
  0%, 20% {
    color: rgba(0, 0, 0, 0);
    text-shadow: 0.25em 0 0 rgba(0, 0, 0, 0), 0.5em 0 0 rgba(0, 0, 0, 0);
  }
  40% {
    color: white;
    text-shadow: 0.25em 0 0 rgba(0, 0, 0, 0), 0.5em 0 0 rgba(0, 0, 0, 0);
  }
  60% {
    text-shadow: 0.25em 0 0 white, 0.5em 0 0 rgba(0, 0, 0, 0);
  }
  80%, 100% {
    text-shadow: 0.25em 0 0 white, 0.5em 0 0 white;
  }
`

export const Container = styled.div<{ $isResizing?: boolean }>`
  position: relative;
  height: 100%;
  width: 100%;

  ${({ $isResizing }) =>
    $isResizing &&
    css`
      user-select: none;
      cursor: col-resize;
    `}
`

export const StyledTable = styled(VirtualizedTable)<{ $autoHeight?: boolean }>`
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;

  ${({ $autoHeight }) =>
    $autoHeight &&
    css`
      max-height: 100%;
      height: auto;
      display: flex;
      flex-direction: column;

      .ReactVirtualized__Table__headerRow {
        flex-shrink: 0;
      }

      .ReactVirtualized__Table__Grid {
        flex-grow: 1;
        height: auto;
      }
    `}

  .ReactVirtualized__Table__headerRow {
    cursor: initial;
    border-bottom: 1px solid
      ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral300};
  }

  .ReactVirtualized__Grid__innerScrollContainer {
    & > div:hover {
      background: ${({ theme }: { theme: Theme }) =>
        theme.semantic.color.background.neutral300};
    }
  }

  .ReactVirtualized__Grid {
    overflow: auto;
    scrollbar-width: thin;
  }

  /* Row styles */
  .virtual-table-row {
    cursor: pointer;
    border-top-width: 0;

    & > div:first-of-type {
      border-left: 3px solid transparent;
    }
  }

  .virtual-table-row-even {
    background: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.background.neutral100};

    .stream-entry-actions {
      background-color: ${({ theme }: { theme: Theme }) =>
        theme.semantic.color.background.neutral100};
    }
  }

  .table-row-selected {
    background: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.background.neutral300};

    & > div:first-of-type {
      border-left: 3px solid transparent;
      border-left-color: ${({ theme }: { theme: Theme }) =>
        theme.semantic.color.border.primary500};
    }
  }

  /* Column styles */
  .virtual-table-row-column {
    margin: 0;

    &.noPadding > div {
      padding: 0;
    }
  }

  .virtual-table-header-column {
    margin: 0;
  }

  .virtual-table-disable-scroll {
    overflow-y: hidden;
  }
`

export const TableRowCell = styled.div`
  display: flex;
  align-items: center;
  box-sizing: border-box;
  padding: 8px 18px;
  min-height: 43px;
`

export const HeaderCell = styled.div`
  overflow: hidden;
  display: flex;
  align-items: center;
  padding: 8px;
  min-height: ${HEADER_HEIGHT};
  text-transform: none;
  white-space: nowrap;
`

export const HeaderButton = styled.button<{ $isSorted?: boolean }>`
  overflow: hidden;
  display: flex;
  align-items: center;
  min-height: ${HEADER_HEIGHT};
  text-transform: none;
  white-space: nowrap;
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;

  &:hover,
  &:focus {
    text-decoration: underline;
  }
`

export const TableFooter = styled.div`
  width: 100%;
  height: ${FOOTER_HEIGHT};
  position: absolute;
  bottom: -38px;
  z-index: 1;
  padding: 8px;
  display: flex;
  align-items: center;
  border-top: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral300};
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral100};

  & > div {
    min-width: 100px;
    margin-right: 8px;
  }
`

export const Placeholder = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px;
  height: 100%;
  width: 100%;
  white-space: pre-wrap;
`

export const Loading = styled.span<{ $show?: boolean }>`
  opacity: ${({ $show }) => ($show ? 1 : 0)};

  &:after {
    content: ' .';
    animation: ${dots} 1s steps(5, end) infinite;
  }
`

export const ResizeTrigger = styled.div`
  position: absolute;
  height: 100%;
  right: -4px;
  width: 7px;
  cursor: col-resize;
  z-index: 2;

  &:before {
    content: '';
    display: block;
    width: 7px;
    height: 8px;
    border-left: 1px solid
      ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral200};
    border-right: 1px solid
      ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral200};
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }
`
