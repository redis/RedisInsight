import React from 'react'
import styled from 'styled-components'
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

// A plain div (not `Row`) so it can hold the ResizeObserver ref that drives
// the responsive preview label — layout components don't forward refs.
export const ActionRow = styled.div<{
  children?: React.ReactNode
  ref?: React.Ref<HTMLDivElement>
}>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.core.space.space100};
  min-height: ${ACTION_ROW_HEIGHT};
`

// `Row` (`FlexGroup direction="row"`) supplies the flex container; only
// the fixed height needs to live in the styles file so the checkbox lines
// up with the adjacent TextInput's vertical midline. The consuming JSX
// passes `align="center"` as a prop rather than hardcoding it here.
export const InputAlignedBox = styled(Row)`
  height: ${INPUT_HEIGHT};
`
