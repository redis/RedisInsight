import { useTheme } from '@redis-ui/styles'

export type CommonProps = {
  className?: string
  'aria-label'?: string
  'data-testid'?: string
}

export type Theme = ReturnType<typeof useTheme>

const ASC = 'asc'
const DESC = 'desc'
export type Direction = typeof ASC | typeof DESC
export interface PropertySort {
  field: string
  direction: Direction
}
