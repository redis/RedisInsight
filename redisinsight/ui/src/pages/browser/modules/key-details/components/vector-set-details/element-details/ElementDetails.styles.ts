import styled from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'
import { TextArea } from 'uiSrc/components/base/inputs'
import { IconButton } from 'uiSrc/components/base/forms/buttons'

export const Body = styled(Col)`
  gap: ${({ theme }) => theme.core?.space?.space400};
  padding-top: ${({ theme }) => theme.core?.space?.space100};
`

export const VectorTextArea = styled(TextArea)`
  font-family: 'Source Code Pro';
  border: 1px solid ${({ theme }) => theme.semantic?.color?.border?.neutral500};
  scrollbar-width: thin;
  padding: ${({ theme }) => theme.core?.space?.space025};
  padding-right: ${({ theme }) => theme.core?.space?.space400};
`

export const VectorWrapper = styled.div`
  position: relative;
  width: 100%;
`

export const VectorActions = styled(Col)`
  position: absolute;
  top: ${({ theme }) => theme.core?.space?.space150};
  right: ${({ theme }) => theme.core?.space?.space150};
  z-index: 1;
`

export const EditorWrapper = styled.div<{ children: React.ReactNode }>`
  position: relative;
  width: 100%;
  height: 200px;
  border: 1px solid ${({ theme }) => theme.semantic?.color?.border?.neutral500};
`

export const EditButton = styled(IconButton)`
  position: absolute;
  top: ${({ theme }) => theme.core?.space?.space150};
  right: ${({ theme }) => theme.core?.space?.space200};
  z-index: 1;
`
