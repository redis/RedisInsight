import styled from 'styled-components'
import { Checkbox } from 'uiSrc/components/base/forms/checkbox/Checkbox'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'

/** Subheader strip hosting the Context control directly above the results
 *  table, mirroring ViewTab's SubheaderContainer so the tabs feel like
 *  siblings. */
export const SubheaderContainer = styled(FlexItem)`
  padding: ${({ theme }) =>
    `${theme.core?.space.space150} ${theme.core?.space.space200} 0`};
`

/** Checkbox with its label's trailing padding removed so a following InfoHint
 *  hugs the text. That padding is on the inner <label>, not the
 *  className-bearing root, so it must be targeted as a descendant. */
export const InlineCheckbox = styled(Checkbox)`
  & label {
    padding-inline-end: 0;
    padding-right: 0;
  }
`

/** Compact fixed-width box so the count reads as a small inline field. */
export const NarrowInputBox = styled(Row)`
  width: 110px;
`
