import styled from 'styled-components'
import { Modal } from 'uiSrc/components/base/display/modal'
import { Text } from 'uiSrc/components/base/text'

export const ModalContent = styled(Modal.Content.Compose)`
  width: 600px;
`

export const Question = styled(Text)`
  color: ${({ theme }) => theme.semantic.color.text.secondary600};
`
