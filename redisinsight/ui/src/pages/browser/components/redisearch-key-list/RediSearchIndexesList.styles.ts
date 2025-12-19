import styled from 'styled-components'

export const Container = styled.div<React.HTMLAttributes<HTMLDivElement>>`
  height: 36px;
  width: 200px;
  min-width: 80px;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
`

export const RefreshAction = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  z-index: 6;

  &:hover {
    background-color: var(--ri-semantic-color-background-neutral200);
  }

  &:focus-visible {
    outline: 2px solid var(--ri-semantic-color-border-focus);
    outline-offset: 2px;
  }

  &[aria-disabled='true'] {
    cursor: not-allowed;
    opacity: 0.5;
    pointer-events: none;
  }
`
