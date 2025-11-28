import styled from 'styled-components'

type DivProps = {
  children: React.ReactNode
}

export const ClusterDetailsPageWrapper = styled.div<DivProps>`
  height: 100%;
  padding: 0 1.6rem;
`

export const ClusterDetailsPageContent = styled.div<DivProps>`
  overflow-y: auto;
  overflow-x: hidden;
  max-height: calc(100% - 134px);
  max-width: 1920px;
`
