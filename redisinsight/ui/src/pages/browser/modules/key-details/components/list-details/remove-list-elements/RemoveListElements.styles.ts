import styled from 'styled-components'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'

export const Popover = styled.div`
  max-width: 312px;
  word-wrap: break-word;
`

export const InfoIcon = styled(RiIcon)`
  height: 41px;
  width: 40px;
  color: #b5b6c0;
  padding: 0 8px;
  cursor: pointer;
`

export const AppendInfo = styled.div`
  color: ${({ theme }) => theme.semantic.color.text.neutral600};
  display: flex;
  margin-top: 1rem;
`
