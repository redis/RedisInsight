interface ErrorWithStatusCode {
  statusCode?: number
  name?: string
  [key: string]: any
}

export interface AddErrorButtonProps {
  name: string
  error?: string | ErrorWithStatusCode | null
  alias?: string
  loading?: boolean
  onAddInstance?: (name: string) => void
}
