import React from 'react'
import styled from 'styled-components'
import { Col, Row } from 'uiSrc/components/base/layout/flex'

export const EditorWrapper = styled(Col)`
  height: 100%;
  width: 100%;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.semantic.color.border.neutral500};
  border-radius: ${({ theme }) => theme.components.card.borderRadius};
`

export const ToggleBar = styled(Row).attrs({
  align: 'center',
  justify: 'start',
  gap: 'l',
  grow: false,
})`
  padding: ${({ theme }) =>
    `${theme.core.space.space100} ${theme.core.space.space200}`};
  border-bottom: 1px solid
    ${({ theme }) => theme.semantic.color.border.neutral500};
  flex-shrink: 0;
`

export const EditorContainer = styled.div<{ children?: React.ReactNode }>`
  flex: 1;
  min-height: 0;
  position: relative;
`

export const ActionsBar = styled(Row).attrs({
  align: 'center',
  justify: 'end',
  gap: 'l',
  grow: false,
})`
  padding: ${({ theme }) =>
    `${theme.core.space.space100} ${theme.core.space.space200}`};
  border-top: 1px solid ${({ theme }) => theme.semantic.color.border.neutral500};
  flex-shrink: 0;
`
