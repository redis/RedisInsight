import { find } from 'lodash'
import { EuiTableFieldDataColumnType } from '@elastic/eui'

const MIN_COLUMN_WIDTH = 180
const getColumnWidth = (width?: string) =>
  width && /^[0-9]+px/.test(width) ? parseInt(width, 10) : MIN_COLUMN_WIDTH
const hideColumn = <T>(column: EuiTableFieldDataColumnType<T>) => ({
  ...column,
  width: '0px',
  className: 'hiddenColumn',
})
const findColumn = <T>(
  columns: EuiTableFieldDataColumnType<T>[],
  colName: string,
) => find(columns, ({ field }) => field === colName)

export { MIN_COLUMN_WIDTH, getColumnWidth, hideColumn, findColumn }
