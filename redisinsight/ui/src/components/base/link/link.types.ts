import { LinkProps } from '@redis-ui/components'

// TODO [DA]: Export the color functionality and use both for Link and Text
export type EuiColorNames =
  | 'inherit'
  | 'default'
  | 'primary'
  | 'text'
  | 'subdued'
  | 'danger'
  | 'ghost'
  | 'accent'
  | 'warning'
  | 'success'

export type ColorType = LinkProps['color'] | EuiColorNames | (string & {})

export type RiLinkProps = Omit<LinkProps, 'color'> & {
  color?: ColorType
  underline?: boolean
}

export type MapProps = RiLinkProps & {
  $color?: ColorType
  $underline?: boolean
}
