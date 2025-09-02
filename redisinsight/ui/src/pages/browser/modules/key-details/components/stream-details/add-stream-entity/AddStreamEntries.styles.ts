import styled from 'styled-components'
import { Theme } from 'uiSrc/components/base/theme/types'

export const EntryIdContainer = styled.div`
  width: 50%;
  flex-shrink: 0;
`

export const FieldsWrapper = styled.div`
  flex-grow: 1;
  flex-shrink: 0;
  width: 100%;
  margin-top: ${({ theme }: { theme: Theme }) => theme.core.space.space150};
`
