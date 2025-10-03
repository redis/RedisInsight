import { RadioGroup } from '@redis-ui/components'
import { Theme } from '@redis-ui/styles'
import styled from 'styled-components'

import { FlexGroup, Row } from 'uiSrc/components/base/layout/flex'
import { Table } from 'uiSrc/components/base/layout/table'

export const StyledNamespacesBrowser = styled(FlexGroup)`
  max-width: 300px;
`

export const StyledHeader = styled(Row)`
  padding: ${({ theme }: { theme: Theme }) => theme.core.space.space150};
`

export const VerticalSeparator = styled.div`
  width: 1px;
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.border.neutral400};
  height: 16px;
`

export const StyledRadioGroup = styled(RadioGroup.Compose)`
  flex-grow: 1;
  padding: 0;
`

export const StyledTableContainer = styled(Table.Compose)`
  height: 100%;
`
