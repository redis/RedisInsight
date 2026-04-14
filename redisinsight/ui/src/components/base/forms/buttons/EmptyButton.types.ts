import { TextButton } from '@redis-ui/components'
import { IconType } from 'uiSrc/components/base/icons'
import { FlexProps } from 'uiSrc/components/base/layout/flex/flex.styles'

export type EmptyButtonProps = React.ComponentProps<typeof TextButton> & {
  icon?: IconType
  iconSide?: 'left' | 'right'
  loading?: boolean
  size?: 'small' | 'large' | 'medium'
  justify?: FlexProps['justify']
}
