import styled from 'styled-components'
import { type Theme } from 'uiSrc/components/base/theme/types'

const PADDING_CELL = '12px'

export const Container = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
`

export const Grid = styled.div`
  scrollbar-width: thin;
  position: relative;
`

export const GridItem = styled.div<{ $odd?: boolean }>`
  z-index: 1;
  padding: ${PADDING_CELL};
  border: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral500};
  border-left-width: 0;
  border-top-width: 0;
  cursor: pointer;

  background-color: ${({ $odd, theme }: { $odd?: boolean; theme: Theme }) =>
    $odd
      ? theme.semantic.color.background.neutral200
      : theme.semantic.color.background.neutral100};

  &.penult {
    border-right: 0;
  }
`

export const GridItemLast = styled(GridItem)`
  z-index: 6;
  margin-top: -50px;
  padding-top: 16px;
  border-left: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral500};
`

export const GridHeaderCell = styled.hgroup`
  border: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral300};

  &:not(:last-of-type) {
    border-right: 0;
  }

  &:first-of-type {
    border-right: 1px solid
      ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral300};
  }

  &:last-of-type,
  &:nth-of-type(2) {
    border-left: 0;
  }

  &:last-of-type {
    border-left: 1px solid
      ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral300};
  }
`

export const GridHeaderItem = styled.div<{ $isLast?: boolean }>`
  overflow: hidden;
  align-items: center;
  line-height: 38px;
  height: 58px;
  text-transform: none;
  z-index: 5;
  padding: ${PADDING_CELL};
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral100};
`

export const GridHeaderItemSortable = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`

export const NoItems = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral500};
`

export const Progress = styled.span``
