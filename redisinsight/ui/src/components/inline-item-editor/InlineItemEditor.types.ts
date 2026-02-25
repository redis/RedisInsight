import React from 'react'
import type { FlattenSimpleInterpolation } from 'styled-components'

import { Row } from 'uiSrc/components/base/layout/flex'

export type Positions = 'top' | 'bottom' | 'left' | 'right' | 'inside'
export type Design = 'default' | 'separate'
export type InputVariant = 'outline' | 'underline'

export interface InlineItemEditorProps {
  onDecline: (event?: React.MouseEvent<HTMLElement>) => void
  onApply: (value: string, event: React.MouseEvent) => void
  onChange?: (value: string) => void
  fieldName?: string
  initialValue?: string
  placeholder?: string
  controlsPosition?: Positions
  controlsDesign?: Design
  maxLength?: number
  expandable?: boolean
  isLoading?: boolean
  isDisabled?: boolean
  isInvalid?: boolean
  disableEmpty?: boolean
  disableByValidation?: (value: string) => boolean
  children?: React.ReactElement
  validation?: (value: string) => string
  getError?: (
    value: string,
  ) => { title: string; content: string | React.ReactNode } | undefined
  declineOnUnmount?: boolean
  iconSize?: 'S' | 'M' | 'L'
  viewChildrenMode?: boolean
  autoComplete?: string
  controlsClassName?: string
  disabledTooltipText?: { title: string; content: string | React.ReactNode }
  preventOutsideClick?: boolean
  disableFocusTrap?: boolean
  approveByValidation?: (value: string) => boolean
  approveText?: { title: string; text: string }
  textFiledClassName?: string
  variant?: InputVariant
  styles?: {
    inputContainer?: {
      width?: string
      height?: string
    }
    input?: {
      width?: string
      height?: string
    }
    actionsContainer?: {
      width?: string
      height?: string
    }
  }
}

export type ActionsContainerProps = React.ComponentProps<typeof Row> & {
  $positionStyles: FlattenSimpleInterpolation
  $design?: InlineItemEditorProps['controlsDesign']
  $width?: string
  $height?: string
}
