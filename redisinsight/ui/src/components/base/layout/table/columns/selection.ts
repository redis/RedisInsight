import { SelectionCell } from './components/selectionCell'
import { SelectionHeader } from './components/selectionHeader'

/**
 * @see [Row selection]{@link https://redislabsdev.github.io/redis-ui/?path=/docs/table-table-rowselection--docs#usage}
 */
export const selectionColumn = {
  id: 'row-selection',
  maxSize: 50,
  size: 50,
  isHeaderCustom: true,
  header: SelectionHeader,
  cell: SelectionCell,
}
