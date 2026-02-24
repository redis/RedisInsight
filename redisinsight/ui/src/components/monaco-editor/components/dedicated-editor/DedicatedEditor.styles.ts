import { type HTMLAttributes } from 'react'
import styled from 'styled-components'
import { RiSelect } from 'uiSrc/components/base/forms/select/RiSelect'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const LangSelect = styled(RiSelect)`
  appearance: none;
  border: 0 none;
  outline: none;
  background-color: transparent;
  max-width: 200px;
  max-height: ${({ theme }: { theme: Theme }) => theme.core.space.space300};

  &:active,
  &:focus,
  &:hover,
  &[data-state='open'] {
    background-color: transparent;
  }
`

export const Rnd = styled.div`
  width: 100%;
  z-index: 100;
`

export const Container = styled.div<HTMLAttributes<HTMLDivElement>>`
  height: 100%;
  word-break: break-word;
  text-align: left;
  letter-spacing: 0;
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral100};
  color: ${({ theme }: { theme: Theme }) =>
    theme.components.typography.colors.secondary};
  border: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.primary500};
  border-radius: ${({ theme }: { theme: Theme }) => theme.core.space.space050};
  padding-left: ${({ theme }: { theme: Theme }) => theme.core.space.space050};
  padding-right: ${({ theme }: { theme: Theme }) => theme.core.space.space050};
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
`

export const Input = styled.div<HTMLAttributes<HTMLDivElement>>`
  height: calc(
    100% - ${({ theme }: { theme: Theme }) => theme.core.space.space550}
  );
  width: 100%;
`

export const Actions = styled.div<HTMLAttributes<HTMLDivElement>>`
  height: ${({ theme }: { theme: Theme }) => theme.core.space.space300};
  width: 100%;
  display: flex;
  align-items: center;
  padding: ${({ theme }: { theme: Theme }) => theme.core.space.space050};
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral100};
  border-radius: ${({ theme }: { theme: Theme }) =>
    `0 0 ${theme.core.space.space050} ${theme.core.space.space050}`};
  justify-content: space-between;
`

export const DeclineBtn = styled.span`
  &:hover span {
    color: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.text.danger500};
  }
`

export const ApplyBtn = styled.span`
  margin-left: ${({ theme }: { theme: Theme }) => theme.core.space.space050};

  &:hover span {
    color: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.text.primary500};
  }
`
