import '@tanstack/react-table'
import { RowData } from '@redis-ui/table'

export * from '@redis-ui/table'

export type AnyFunction = (...args: any[]) => any

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    action?: AnyFunction
  }
}
