import styled from 'styled-components'

export const FixedWrapper = styled.div`
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
`

export const ScrollableWrapper = styled.div<
  React.HTMLAttributes<HTMLDivElement>
>`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  min-height: 0;
`

export const ContentWrapper = styled.div<React.HTMLAttributes<HTMLDivElement>>`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
`
