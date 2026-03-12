import styled from 'styled-components'
import { Modal } from 'uiSrc/components/base/display/modal'
import { Row } from 'uiSrc/components/base/layout/flex'
import { Text, Title } from 'uiSrc/components/base/text'

export const ModalContent = styled(Modal.Content.Compose)`
  width: 540px;
`

export const Header = styled(Modal.Content.Header.Compose)`
  flex-direction: column;
  gap: ${({ theme }) => theme.core.space.space300};
`

export const Illustration = styled(Row)`
  height: 132px;
  justify-content: center;
`

export const Heading = styled(Title)`
  text-align: center;
`

export const Description = styled(Text)`
  text-align: center;
`
