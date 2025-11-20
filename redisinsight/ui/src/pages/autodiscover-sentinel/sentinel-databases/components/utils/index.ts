import {
  type AnyFunction,
  type Column,
} from 'uiSrc/components/base/layout/table'

export const getMetaAction = <TData, TValue = unknown>(
  column: Column<TData, TValue>,
): AnyFunction => {
  const action = column.columnDef?.meta?.action as AnyFunction | undefined
  return (
    action ||
    (() => {
      console.warn('Trying to use column.meta.action, but one is not defined.')
    })
  )
}

export const getMetaProps = <TProps = Record<string, any>>(
  column: Column<any, any>,
): TProps => {
  return (column.columnDef?.meta?.props as TProps) || ({} as TProps)
}