import { type PopoverProps } from '@redis-ui/components'

import { anchorPositionMap, panelPaddingSizeMap } from './config'

type AnchorPosition = keyof typeof anchorPositionMap

type PanelPaddingSize = keyof typeof panelPaddingSizeMap

export type RiPopoverProps = Omit<
  PopoverProps,
  | 'open'
  | 'onClickOutside'
  | 'autoFocus'
  | 'content'
  | 'className'
  | 'placement'
  | 'align'
> & {
  isOpen?: PopoverProps['open']
  closePopover?: PopoverProps['onClickOutside']
  ownFocus?: PopoverProps['autoFocus']
  button: PopoverProps['content']
  anchorPosition?: AnchorPosition
  panelPaddingSize?: PanelPaddingSize
  anchorClassName?: string
  panelClassName?: string
  'data-testid'?: string
}
