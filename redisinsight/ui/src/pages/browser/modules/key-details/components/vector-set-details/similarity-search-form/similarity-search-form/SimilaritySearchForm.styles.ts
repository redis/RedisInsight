import { HTMLAttributes } from 'react'
import styled from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'
import { MIDDLE_SCREEN_RESOLUTION } from 'uiSrc/constants'

export const FormContainer = styled(Col)`
  width: 100%;
  padding: ${({ theme }) => theme.core.space.space150};
  background: ${({ theme }) => theme.semantic.color.background.neutral300};
  border-bottom: 1px solid
    ${({ theme }) => theme.semantic.color.border.neutral500};
`

export const ModeButtonContent = styled.span<HTMLAttributes<HTMLSpanElement>>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
`

export const ModeInfoIcon = styled.span<HTMLAttributes<HTMLSpanElement>>`
  display: inline-flex;
  align-items: center;
  color: ${({ theme }) => theme.semantic.color.text.neutral500};
  vertical-align: middle;
`

/**
 * Inline prefix label for the Count quantity counter. Hidden on narrower
 * panels so the toggle + input + counter row doesn't overflow — mirrors
 * the responsive pattern used in `VectorSetKeySubheader` /
 * `AddItemsAction` (`MIDDLE_SCREEN_RESOLUTION`).
 */
export const CountInlineLabel = styled.span<HTMLAttributes<HTMLSpanElement>>`
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  color: ${({ theme }) => theme.semantic.color.text.neutral800};

  @media (max-width: ${MIDDLE_SCREEN_RESOLUTION}px) {
    display: none;
  }
`

/**
 * Wraps the "Filter" text and the inline help popover trigger so the help
 * icon sits flush to the label rather than the input. Uses inline-flex so it
 * still renders correctly inside the underlying `<label>` element.
 */
export const FilterLabel = styled.span<HTMLAttributes<HTMLSpanElement>>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.core.space.space050};
`
