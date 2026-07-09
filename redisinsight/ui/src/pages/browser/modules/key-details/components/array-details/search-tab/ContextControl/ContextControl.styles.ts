import styled from 'styled-components'
import { Checkbox } from 'uiSrc/components/base/forms/checkbox/Checkbox'
import { Row } from 'uiSrc/components/base/layout/flex'

/** Trim the checkbox label's trailing padding so the InfoHint hugs the text. */
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
