import styled from 'styled-components'

/**
 * The package sizes its own chrome against the space it is given, so the host
 * only has to hand it a full-height flex container.
 */
export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
  overflow: hidden;
`
