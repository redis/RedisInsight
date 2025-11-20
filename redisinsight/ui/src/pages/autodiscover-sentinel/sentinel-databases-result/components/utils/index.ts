import { ApiStatusCode } from 'uiSrc/constants'
import { AddRedisDatabaseStatus } from 'uiSrc/slices/interfaces'

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
