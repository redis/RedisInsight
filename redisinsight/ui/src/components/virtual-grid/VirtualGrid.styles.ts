import styled from 'styled-components'
import { ComponentPropsWithRef } from 'react'
import { useTheme } from '@redis-ui/styles'

const useGridStyles = () => {
  const theme = useTheme()
  const tableStyles = theme.components.table.table

  return {
    bg: tableStyles.tableContainer.backgroundColor,
    borderColor: tableStyles.tableHeaderRow.separator.color,
    borderRadius: tableStyles.tableContainer.borderRadius,
    boxShadow: tableStyles.tableContainer.boxShadow,
    headerBg: tableStyles.tableHeaderRow.bgColor,
    headerHeight: tableStyles.tableHeaderRow.minHeight,
    thCellColor: tableStyles.tableHeaderCell.color,
    thCellPadding: tableStyles.tableHeaderCell.padding,
    thCellBorder: tableStyles.tableHeaderCell.separator.width,
    thCellBorderColor: tableStyles.tableHeaderCell.separator.color,
    trStripedBgColor: tableStyles.tableBodyRow.backgroundColor,
    tdColor: tableStyles.tableBodyCell.color,
    tdPadding: tableStyles.tableBodyCell.padding,
  }
}

export const Container = styled.div<ComponentPropsWithRef<'div'>>`
  position: relative;
  height: 100%;
  width: 100%;
`

export const Grid = styled.div<ComponentPropsWithRef<'div'>>`
  background-color: ${() => useGridStyles().bg};
  scrollbar-width: thin;
  position: relative;
`

export const GridItem = styled.div<
  ComponentPropsWithRef<'div'> & { $odd?: boolean }
>`
  z-index: 1;
  padding: ${() => useGridStyles().tdPadding};
  border: 1px solid ${() => useGridStyles().borderColor};
  border-left-width: 0;
  border-top-width: 0;
  cursor: pointer;

  background-color: ${({ $odd }: { $odd?: boolean }) =>
    $odd ? 'inherit' : useGridStyles().trStripedBgColor};

  &.penult {
    border-right: 0;
  }
`

export const GridItemLast = styled(GridItem)`
  z-index: 6;
  margin-top: -50px;
  padding-top: 16px;
`

export const GridHeaderCell = styled.hgroup<ComponentPropsWithRef<'hgroup'>>`
  border: 1px solid ${() => useGridStyles().thCellBorderColor};
  height: ${() => useGridStyles().headerHeight};

  &:not(:last-of-type) {
    border-right: 0;
  }

  &:first-of-type {
    border-right: 1px solid ${() => useGridStyles().thCellBorderColor};
  }

  &:last-of-type,
  &:nth-of-type(2) {
    border-left: 0;
  }

  &:last-of-type {
    border-left: 1px solid ${() => useGridStyles().thCellBorderColor};
  }
`

export const GridHeaderItem = styled.div<
  ComponentPropsWithRef<'div'> & { $isLast?: boolean }
>`
  overflow: hidden;
  align-items: center;
  line-height: 38px;
  height: ${() => useGridStyles().headerHeight};
  text-transform: none;
  z-index: 5;
  padding: ${() => useGridStyles().tdPadding};
`

export const GridHeaderItemSortable = styled.button<
  ComponentPropsWithRef<'button'>
>`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`

export const NoItems = styled.div<ComponentPropsWithRef<'div'>>`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${() => useGridStyles().thCellBorder};
`
