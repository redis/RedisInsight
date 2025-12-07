import React, { ReactNode } from 'react'
import { GridChildComponentProps } from 'react-window'
import { ITableColumn } from './interfaces'

export const getCellIndicies = (child: React.ReactChild) => ({
  row: child.props.rowIndex,
  column: child.props.columnIndex,
})

export const getShownIndicies = (children: typeof React.Children) => {
  let minRow = Infinity
  let maxRow = -Infinity
  let minColumn = Infinity
  let maxColumn = -Infinity

  React.Children.forEach(children, (child) => {
    const { row, column } = getCellIndicies(child)
    minRow = Math.min(minRow, row)
    maxRow = Math.max(maxRow, row)
    minColumn = Math.min(minColumn, column)
    maxColumn = Math.max(maxColumn, column)
  })

  return {
    from: {
      row: minRow,
      column: minColumn,
    },
    to: {
      row: maxRow,
      column: maxColumn,
    },
  }
}

export const useInnerElementType = (
  Cell: GridChildComponentProps<null>,
  columnWidth: (
    index: number,
    width: number,
    columns: ITableColumn[],
  ) => number,
  rowHeight: (index: number) => number,
  columnCount: number,
  tableWidth: number,
  columns: ITableColumn[],
  options: Record<string, any> = {},
) =>
  React.useMemo(
    () =>
      React.forwardRef((props: ReactNode, ref) => {
        const sumRowsHeights = (index: number) => {
          let sum = 0
          let currentIndex = index

          while (currentIndex > 1) {
            sum += rowHeight(index - 1)
            currentIndex -= 1
          }

          return sum
        }

        const sumColumnWidths = (index: number) => {
          let sum = 0
          let currentIndex = index

          while (currentIndex > 1) {
            sum += columnWidth(index - 1, tableWidth, columns)
            currentIndex -= 1
          }

          return sum
        }

        const shownIndecies = getShownIndicies(props.children)

        let children = React.Children.map(props.children, (child) => {
          const { column, row } = getCellIndicies(child)

          // do not show non-sticky cell
          if (column === 0 || row === 0 || column === columnCount) {
            return null
          }

          return {
            ...child,
            props: {
              ...child.props,
              style: {
                ...child.props.style,
                width: columnWidth(column, tableWidth, columns),
              },
            },
          }
        })

        children = React.Children.toArray(children)

        for (let i = 1; i < children.length; i++) {
          const child = children[i]
          const prevChild = children[i - 1]
          const { row } = getCellIndicies(child)
          const { row: prevRow } = getCellIndicies(prevChild)

          if (prevRow !== row) {
            children[i] = child
          } else {
            children[i] = {
              ...child,
              props: {
                ...child.props,
                style: {
                  ...child.props.style,
                  left:
                    prevChild.props.style.left + prevChild.props.style.width,
                },
              },
            }
          }
        }

        children.push(
          React.createElement(Cell, {
            key: '0:0',
            rowIndex: 0,
            columnIndex: 0,
            style: {
              display: 'inline-flex',
              width: columnWidth(0, tableWidth, columns),
              height: rowHeight(0),
              position: 'sticky',
              top: 0,
              left: 0,
              zIndex: 4,
              borderBottomWidth: 1,
            },
          }),
        )

        const toColumnDelta = options?.stickLastColumnHeaderCell ? -1 : 0
        const shownColumnsCount =
          shownIndecies.to.column + toColumnDelta - shownIndecies.from.column

        for (let i = 1; i <= shownColumnsCount; i += 1) {
          const columnIndex = i + shownIndecies.from.column
          const rowIndex = 0
          const width = columnWidth(columnIndex, tableWidth, columns)
          const height = rowHeight(rowIndex)

          const marginLeft = i === 1 ? sumColumnWidths(columnIndex) : undefined

          children.push(
            React.createElement(Cell, {
              key: `${rowIndex}:${columnIndex}`,
              rowIndex,
              columnIndex,
              style: {
                marginLeft,
                display: 'inline-flex',
                width,
                height,
                position: 'sticky',
                top: 0,
                zIndex: 3,
              },
            }),
          )
        }

        // last sticky column
        if (options?.stickLastColumnHeaderCell) {
          const columnIndex = columns.length - 1
          children.push(
            React.createElement(Cell, {
              key: `0:${columnIndex}`,
              rowIndex: 0,
              columnIndex,
              style: {
                display: 'inline-flex',
                width: columnWidth(columnIndex, tableWidth, columns),
                height: rowHeight(0),
                position: 'sticky',
                top: 0,
                right: 0,
                zIndex: 3,
              },
            }),
          )
        }

        const shownRowsCount = shownIndecies.to.row - shownIndecies.from.row

        for (let i = 1; i <= shownRowsCount; i += 1) {
          const columnIndex = 0
          const rowIndex = i + shownIndecies.from.row
          const width = columnWidth(columnIndex, tableWidth, columns)
          const height = rowHeight(rowIndex)

          const marginTop = i === 1 ? sumRowsHeights(rowIndex) : undefined

          children.push(
            React.createElement(Cell, {
              key: `${rowIndex}:${columnIndex}`,
              rowIndex,
              columnIndex,
              style: {
                marginTop,
                width,
                height,
                position: 'sticky',
                left: 0,
                zIndex: 2,
                borderLeftWidth: 1,
              },
            }),
          )
        }

        return (
          <div
            ref={ref}
            {...props}
            style={{ ...props?.style, width: tableWidth }}
          >
            {children}
          </div>
        )
      }),
    [Cell, columnWidth, rowHeight, columnCount, tableWidth],
  )

export const getColumnWidth = (
  i: number,
  width: number,
  columns: ITableColumn[],
  minColumnWidth: number = 190,
) => {
  const maxTableWidth = columns.reduce(
    (a, { maxWidth = minColumnWidth }) => a + maxWidth,
    0,
  )

  if (maxTableWidth < width) {
    const growingColumnsWidth = columns
      .filter(({ maxWidth = 0 }) => maxWidth)
      .map(({ maxWidth }) => maxWidth)

    const growingColumnsCount = columns.length - growingColumnsWidth.length
    const maxWidthTable =
      growingColumnsWidth?.reduce((a = 0, b = 0) => a + b, 0) ?? 0
    const newColumns = columns.map((column) => {
      const { minWidth, maxWidth = 0 } = column
      const newMinWidth = (width - maxWidthTable) / growingColumnsCount

      return {
        ...column,
        width: maxWidth ? minWidth : newMinWidth,
      }
    })

    return newColumns[i]?.width
  }
  return columns[i]?.minWidth
}
