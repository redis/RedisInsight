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
 * Compact fixed-width box for the Range / LIMIT inputs so they read as small
 * inline fields (`Range [-] to [+]`) rather than stretching the row.
 */
export const NarrowInputBox = styled(Row)`
  width: 110px;
`

/**
 * Fixed minimum width so the action row doesn't reflow when the selected
 * criteria label changes width (Exact / Match / Glob / Regex).
 */
export const CriteriaSelect = styled(RiSelect)`
  min-width: 85px;
`

/**
 * The AND/OR connective sits in the gap between two predicate rows, indented
 * so it reads as joining the rows above and below rather than starting a new
 * field. Offset roughly tracks the criteria column width.
 */
export const ConnectiveRow = styled(Row)`
  padding-left: 48px;
`

export const PreviewToggleButton = styled(ToggleButton)`
  ${({ theme, pressed }) =>
    !pressed && `border-color: ${theme.semantic.color.border.neutral600};`}
`
