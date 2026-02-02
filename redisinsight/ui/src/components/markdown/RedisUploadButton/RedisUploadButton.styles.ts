import styled from 'styled-components'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const Wrapper = styled.div`
  width: 100%;
  max-width: 480px;

  .euiPopover {
    width: 100%;
  }
`

export const Button = styled.span``

export const POPOVER_MIN_WIDTH = '378px'

export const PopoverAnchor = styled.span`
  display: block;
  width: 100%;
`

export const ContainerPopover = styled.div``

export const PopoverIcon = styled.span`
  position: absolute;
  top: 14px;
  left: 14px;
  color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.icon.danger500};
  width: 18px;
  height: 18px;
`

export const PopoverItem = styled.div`
  font-size: 13px;
  line-height: 18px;
  padding-left: 30px;
`

export const PopoverItemTitle = styled.div`
  color: ${({ theme }: { theme: Theme }) =>
    theme.components.typography.colors.primary};
  font-size: 14px;
  line-height: 24px;
  padding-left: 30px;
`

export const Link = styled.span`
  color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.text.primary500};
`

export const PopoverActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 30px;
`

export const UploadApproveBtn = styled.span``
