import styled from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'
import { Theme } from 'uiSrc/components/base/theme/types'

export const StreamEntryContent = styled(Col)`
  max-height: 234px;
  scroll-padding-bottom: 60px;
`

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
