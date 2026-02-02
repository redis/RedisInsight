import styled from 'styled-components'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const Link = styled.div`
  border: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.success500};
  padding: 6px 16px;
  letter-spacing: normal;
  border-radius: 4px;
  text-align: left;
  position: relative;
  width: 100%;
  height: 42px;
  background-size: cover;
  background-position: center;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }

  &:hover {
    transform: translateY(-1px);
  }
`

export const Title = styled.span`
  font-size: 12px;
  position: relative;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1;
  padding-left: 30px;
`

export const Description = styled.span`
  font-size: 10px;
  padding-left: 30px;
  position: relative;
  padding-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1;
  color: ${({ theme }: { theme: Theme }) =>
    theme.components.typography.colors.secondary};
`

export const Icon = styled.span`
  display: block;
  position: absolute;
  right: 14px;
  top: calc(50% - 11px);
  color: ${({ theme }: { theme: Theme }) =>
    theme.components.typography.colors.primary};
  width: 20px;
  height: 20px;
`

export const CloudIcon = styled.span`
  position: absolute;
  width: 28px;
  height: 20px;
  top: 12px;
  left: 16px;
`
