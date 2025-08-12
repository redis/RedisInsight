import styled from 'styled-components'

/* TODO: use theme when it supports theme.semantic.core.radius */
// to replace var(--border-radius-medium)
export const StyledWrapper = styled.div`
  flex: 1;
  height: calc(100% - var(--border-radius-medium));
  width: 100%;
  background-color: ${({ theme }) =>
    theme.semantic?.color.background.neutral100};
  border: 1px solid ${({ theme }) => theme.semantic.color.border.neutral500};
  border-radius: var(--border-radius-medium);
  // HACK: to fix rectangle like view in rounded borders wrapper
  padding-bottom: ${({ theme }) => theme.core.space.space025};

  display: flex;
  flex-direction: column;

  position: relative;
`

export const StyledContainer = styled.div`
  flex: 1;
  width: 100%;
  overflow: auto;
  color: ${({ theme }) => theme.color.gray700};
`

// .container {
//   @include eui.scrollBar;
//   color: var(--euiTextSubduedColor) !important;

//   flex: 1;
//   width: 100%;
//   overflow: auto;
// }
