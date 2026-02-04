import { type TextButtonProps } from '@redis-ui/components'
import { IconType } from 'uiSrc/components/base/icons'
import { FlexProps } from '../../layout/flex'

export type EmptyButtonProps = Omit<TextButtonProps, 'size'> & {
  icon?: IconType
  iconSide?: 'left' | 'right'
  loading?: boolean
  size?: 'small' | 'large' | 'medium'
  justify?: FlexProps['justify']
}
