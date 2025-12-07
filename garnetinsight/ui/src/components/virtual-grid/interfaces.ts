import { ReactNode } from 'react'
import {
  SortOrder,
  TableCellAlignment,
  TableCellTextAlignment,
} from 'uiSrc/constants'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'

export interface IColumnSearchState {
  initialSearchValue?: string
  id: string
  value: string
  prependSearchName: string
  isOpened: boolean
  staySearchAlwaysOpen: boolean
  searchValidation?: (value: string) => string
}

export interface ITableColumn {
  id: string
  label: string | ReactNode
  minWidth?: number
  maxWidth?: number
  isSortable?: boolean
  isSearchable?: boolean
  isSearchOpen?: boolean
  initialSearchValue?: string
  headerClassName?: string
  headerCellClassName?: string
  truncateText?: boolean
  relativeWidth?: number
  absoluteWidth?: number | string
  alignment?: TableCellAlignment
  textAlignment?: TableCellTextAlignment
  render?: (cellData?: any, rowIndex?: any) => any
  className?: string
  prependSearchName?: string
  staySearchAlwaysOpen?: boolean
  searchValidation?: (value: string) => string
}

export interface IProps {
  loading: boolean
  scanned?: number
  columns: ITableColumn[]
  loadMoreItems?: (config: any) => void
  rowHeight?: number
  footerHeight?: number
  selectable?: boolean
  keyName?: RedisResponseBuffer
  headerHeight?: number
  searching?: boolean
  onRowToggleViewClick?: (expanded: boolean, rowIndex: number) => void
  onSearch?: (newState: any) => void
  onWheel?: (event: React.WheelEvent) => void
  onChangeSorting?: (cellData?: any, columnItem?: any) => void
  items?: any
  noItemsMessage?: string | string[] | JSX.Element
  totalItemsCount?: number
  selectedKey?: any
  sortedColumn?: ISortedColumn
  disableScroll?: boolean
  setScrollTopPosition?: (position: number) => void
  scrollTopProp?: number
  hideFooter?: boolean
  maxTableWidth?: number
  hideProgress?: boolean
  stickLastColumnHeaderCell?: boolean
}

export interface ISortedColumn {
  column: string
  order: SortOrder
}
