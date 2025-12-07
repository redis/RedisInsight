import styled from 'styled-components'
import { Theme } from 'uiSrc/components/base/theme/types'
import {
  Section,
  sectionContent,
  SectionTitleWrapper,
} from 'uiSrc/pages/database-analysis/components/styles'
import { SwitchInput } from 'uiSrc/components/base/inputs'

export const Container = styled(Section)`
  position: relative;
  padding-right: 0;

  @media screen and (max-width: 920px) {
    ${SectionTitleWrapper} {
      flex-direction: column;
      align-items: flex-start !important;
    }
  }
`

export const TitleWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;

  @media screen and (max-width: 920px) {
    margin-bottom: ${({ theme }: { theme: Theme }) =>
      theme.core.space.space150};
  }
`

export const Content = styled.div`
  width: 100%;
  height: 300px;
  ${sectionContent}
`

export const LoadingWrapper = styled(Content)`
  margin-top: ${({ theme }: { theme: Theme }) => theme.core.space.space400};
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral200};
  border-radius: ${({ theme }: { theme: Theme }) => theme.core.space.space050};
`

export const Chart = styled.div<React.HTMLAttributes<HTMLDivElement>>`
  height: calc(
    100% - ${({ theme }: { theme: Theme }) => theme.core.space.space400}
  );
  clear: both;
  width: 100%;
`

export const Switch = styled(SwitchInput)`
  float: right;
  padding-right: ${({ theme }: { theme: Theme }) => theme.core.space.space200};

  @media screen and (max-width: 920px) {
    margin-left: ${({ theme }: { theme: Theme }) =>
      `-${theme.core.space.space100}`};
  }
`
