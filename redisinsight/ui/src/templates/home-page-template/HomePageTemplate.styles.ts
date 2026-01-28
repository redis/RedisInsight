import styled from 'styled-components'
import { Row } from 'uiSrc/components/base/layout/flex'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const PageDefaultHeader = styled(Row)`
  height: ${({ theme }: { theme: Theme }) => theme.core.space.space800};
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral100};
  border-bottom: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral500};
  padding: 0 ${({ theme }: { theme: Theme }) => theme.core.space.space200};
  margin-bottom: ${({ theme }: { theme: Theme }) => theme.core.space.space200};
`

export const PageWrapper = styled.div`
  height: calc(
    100% - ${({ theme }: { theme: Theme }) => theme.core.space.space800} -
      ${({ theme }: { theme: Theme }) => theme.core.space.space200}
  );
  overflow: hidden;
`

export const ExplorePanelWrapper = styled.div`
  padding-bottom: ${({ theme }: { theme: Theme }) => theme.core.space.space200};
  height: 100%;
`
