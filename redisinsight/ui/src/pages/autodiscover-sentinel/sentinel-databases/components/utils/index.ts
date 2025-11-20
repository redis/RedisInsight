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

