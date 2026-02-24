import { type PopoverProps } from '@redis-ui/components'

import { ReactNode } from 'react'
import {
  ANCHOR_POSITION_MAP,
  PANEL_PADDING_SIZE_MAP,
} from './RiPopover.constants'

type AnchorPosition = keyof typeof ANCHOR_POSITION_MAP

type PanelPaddingSize = keyof typeof PANEL_PADDING_SIZE_MAP

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
  customOutsideDetector?: boolean
}
