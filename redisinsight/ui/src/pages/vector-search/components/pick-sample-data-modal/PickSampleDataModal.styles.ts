import React from 'react'

import styled, { css } from 'styled-components'
import { Modal } from 'uiSrc/components/base/display/modal'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { Text, Title } from 'uiSrc/components/base/text'
import { Theme } from 'uiSrc/components/base/theme/types'

export const ModalContent = styled(Modal.Content.Compose)`
  width: 660px;
  border-radius: ${({ theme }: { theme: Theme }) => theme.core.space.space100};
`

export const VisuallyHiddenTitle = styled(Modal.Content.Header.Title)`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
`

export const ModalBody = styled(Col)`
  padding: ${({ theme }: { theme: Theme }) => theme.core.space.space500};
`

export const Illustration = styled(Row)`
  height: 110px;
`

export const Heading = styled(Title)`
  max-width: 360px;
  text-align: center;
  align-self: center;
  margin: 0 auto;
`

export const Subtitle = styled(Text)`
  line-height: 1.5;
`

export const RadioCardList = styled(Col)`
  width: 100%;
`

export const RadioCard = styled.label<
  React.LabelHTMLAttributes<HTMLLabelElement> & { $selected: boolean }
>`
  display: flex;
  align-items: center;
  gap: ${({ theme }: { theme: Theme }) => theme.core.space.space150};
  padding: ${({ theme }: { theme: Theme }) =>
    `${theme.core.space.space150} ${theme.core.space.space200}`};
  border: 1px solid;
  border-color: ${({ theme }: { theme: Theme }) =>
    theme.components.boxSelectionGroup.item.states.default?.normal
      ?.borderColor ?? theme.semantic.color.border.neutral300};
  border-radius: ${({ theme }: { theme: Theme }) =>
    theme.components.boxSelectionGroup.item.borderRadius};
  background: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral100};
  cursor: pointer;
  transition: border-color 0.15s ease;

  &:hover {
    border-color: ${({ theme }: { theme: Theme }) =>
      theme.components.boxSelectionGroup.item.states.default?.hover
        ?.borderColor ?? theme.semantic.color.border.neutral400};
  }

  ${({ $selected, theme }) =>
    $selected &&
    css`
      border-color: ${theme.components.boxSelectionGroup.item.states.checked
        ?.normal?.borderColor ?? theme.semantic.color.border.informative400};
    `}
`

export const RadioCardContent = styled(Col)``

export const RadioCardTitle = styled(Text)`
  font-weight: 500;
`

export const RadioCardDescription = styled(Text)``

export const Footer = styled(Row)`
  width: 100%;
  padding: 0 ${({ theme }: { theme: Theme }) => theme.core.space.space400};
  padding-bottom: ${({ theme }: { theme: Theme }) => theme.core.space.space400};
`

export const FooterActions = styled(Row)``

export const ContentSection = styled(Col)`
  width: 100%;
`

export const DatasetSection = styled(Col)`
  width: 100%;
`
