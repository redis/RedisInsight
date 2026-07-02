import styled from 'styled-components'
import { Modal } from 'uiSrc/components/base/display/modal'
import { Col } from 'uiSrc/components/base/layout/flex'

export const StyledContent = styled(Modal.Content.Compose)`
  width: 640px;
  max-width: calc(100vw - 120px);
  max-height: calc(100vh - 120px);
`

export const CardsList = styled(Col)`
  gap: ${({ theme }) => theme.core.space.space150};
  overflow-y: auto;
`

export const VersionSelectWrapper = styled.div`
  max-width: 240px;
`
