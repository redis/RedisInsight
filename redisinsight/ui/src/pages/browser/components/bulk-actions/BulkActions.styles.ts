import styled from 'styled-components'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { Theme } from 'uiSrc/components/base/theme/types'

export const BulkActionsPage = styled(Col)`
  height: 100%;
  overflow: hidden;
`

export const BulkActionsContentActions = styled(Col)`
  height: 100%;
  width: 100%;
`

export const BulkActionsContainer = styled(Col)`
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral100};
  padding: 24px 0;
  height: 100%;
  position: relative;
`

export const BulkActionsHeader = styled(Row)`
  padding: 0 ${({ theme }: { theme: Theme }) => theme.core.space.space200};
`

export const BulkActionsScrollPanel = styled.div`
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  height: 100%;
`
