import styled from 'styled-components'
import { FlexItem } from 'uiSrc/components/base/layout/flex'

/** Subheader strip hosting the right-aligned "Add Elements" action, mirroring
 *  VectorSetKeySubheader so the array view matches the other key types. */
export const SubheaderContainer = styled(FlexItem)`
  padding: ${({ theme }) =>
    `${theme.core?.space.space150} ${theme.core?.space.space200} 0`};
`
