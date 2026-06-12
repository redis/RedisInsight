import styled from 'styled-components'
import { ToggleButton } from 'uiSrc/components/base/forms/buttons'
import { Col, Row } from 'uiSrc/components/base/layout/flex'

/**
 * Height of the action row, sized to fit the expanded `CommandPreview` bar
 * so toggling the preview on/off doesn't reflow the surrounding layout.
 * Mirrors `SimilaritySearchForm`'s ACTION_ROW_HEIGHT.
 */
const ACTION_ROW_HEIGHT = '40px'

/**
 * Height of a TextInput in the Redis UI default size. The inputs row uses
 * `align="end"` so labels stay anchored to the top — this box matches the
 * input element's height so its content (the checkbox) sits at the input's
 * vertical midline rather than dropping to its baseline.
 */
const INPUT_HEIGHT = '36px'

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

export const InputAlignedBox = styled.div`
  display: flex;
  align-items: center;
  height: ${INPUT_HEIGHT};
`

export const PreviewToggleButton = styled(ToggleButton)`
  ${({ theme, pressed }) =>
    !pressed && `border-color: ${theme.semantic.color.border.neutral600};`}
`
