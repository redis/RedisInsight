import styled, { css } from 'styled-components'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const Wrapper = styled.div<{ $isFormDisabled?: boolean }>`
  position: relative;

  ${({ $isFormDisabled }) =>
    $isFormDisabled &&
    css`
      cursor: not-allowed;
      pointer-events: none;
    `}
`

export const SubmitBtn = styled.span`
  width: 24px;
  height: 24px;
  min-width: 24px;
`

export const TOOLTIP_MAX_WIDTH = '340px'

export const TooltipContent = styled.div`
  display: flex;
  align-items: center;
`

export const PopoverAnchor = styled.span`
  position: absolute;
  bottom: 6px;
  right: 10px;
  z-index: 1;
  width: 24px;
  height: 24px;
  min-width: 24px;
`

export const POPOVER_MAX_WIDTH = '324px'

export const AgreementsAccept = styled.span`
  display: block;
  margin-left: auto;
`

export const AgreementText = styled.span`
  margin-top: 6px;
  font-size: 10px;
  line-height: 1.15;
  color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.icon.neutral600};
`
