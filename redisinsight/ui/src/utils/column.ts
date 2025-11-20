import { type Column } from 'uiSrc/components/base/layout/table'
import { ApiStatusCode } from 'uiSrc/constants'
import { AddRedisDatabaseStatus } from 'uiSrc/slices/interfaces'

export const getMetaProps = <TProps = Record<string, any>>(
  column: Column<any, any>,
): TProps => {
  return (column.columnDef?.meta?.props as TProps) || ({} as TProps)
}

// Define an interface for the error object
export interface ErrorWithStatusCode {
  statusCode?: number
  name?: string
  [key: string]: any
}

// Define a function to check if the error is not authorized
export function errorNotAuth(
  error?: string | ErrorWithStatusCode | null,
  status?: AddRedisDatabaseStatus,
) {
  return (
    (typeof error === 'object' &&
      error?.statusCode !== ApiStatusCode.Unauthorized) ||
    status === AddRedisDatabaseStatus.Success
  )
}

