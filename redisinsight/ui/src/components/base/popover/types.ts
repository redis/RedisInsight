import { type PopoverProps } from '@redis-ui/components'

import { anchorPositionMap, panelPaddingSizeMap } from './config'
import { ReactNode } from 'react'

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
  /** @deprecated old prop for popover trigger element, use {@linkcode trigger} */
  button?: PopoverProps['content']
  /** preferred prop for popover trigger element (optional) */
  trigger?: ReactNode
  anchorPosition?: AnchorPosition
  panelPaddingSize?: PanelPaddingSize
  anchorClassName?: string
  /** @deprecated - use {@linkcode className} - this is popover content wrapper class name */
  panelClassName?: string
  /** new preferred prop for popover content wrapper class name (optional) */
  className?: string
  'data-testid'?: string
  /** if true, the trigger will be standalone and will not be wrapped in a span */
  standalone?: boolean
}
