import styled from 'styled-components'
import { ToggleButton } from 'uiSrc/components/base/forms/buttons'
import { RiSelect } from 'uiSrc/components/base/forms/select/RiSelect'
import { Col, Row } from 'uiSrc/components/base/layout/flex'

/**
 * Height of the action row, sized to fit the expanded `CommandPreview` bar
 * so toggling the preview on/off doesn't reflow the surrounding layout.
 * Matches `ArrayRangeForm`'s ACTION_ROW_HEIGHT so the two tabs feel like
 * siblings.
 */
const ACTION_ROW_HEIGHT = '40px'

export const FormContainer = styled(Col)`
  width: 100%;
  padding: ${({ theme }) => theme.core.space.space150};
  background: ${({ theme }) => theme.semantic.color.background.neutral300};
  border-bottom: 1px solid
    ${({ theme }) => theme.semantic.color.border.neutral500};
`

export const ActionRow = styled(Row)`
  min-height: ${ACTION_ROW_HEIGHT};
`

/**
 * Fixed minimum width so the action row doesn't reflow when the selected
 * criteria label changes width (Exact / Match / Glob / Regex).
 */
export const CriteriaSelect = styled(RiSelect)`
  min-width: 85px;
`

export const PreviewToggleButton = styled(ToggleButton)`
  ${({ theme, pressed }) =>
    !pressed && `border-color: ${theme.semantic.color.border.neutral600};`}
`
