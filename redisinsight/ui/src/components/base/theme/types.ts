import { useTheme } from '@redis-ui/styles'

export type CommonProps = {
  className?: string
  'aria-label'?: string
  'data-testid'?: string
}

export type Theme = ReturnType<typeof useTheme>
