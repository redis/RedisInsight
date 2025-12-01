import styled from 'styled-components'
import { sectionContent } from 'uiSrc/pages/database-analysis/components/styles'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import { truncateText } from 'uiSrc/styles/mixins'

export const SectionContent = styled.div<React.HTMLAttributes<HTMLDivElement>>`
  ${sectionContent}
`

export const NoNamespaceMsg = styled(Col).attrs({
  align: 'center',
  justify: 'center',
})`
  margin: 80px auto 100px;
`

export const NoNamespaceText = styled(Text).attrs({
  size: 'M',
})`
  margin-top: 10px;
`

export const NoNamespaceBtn = styled(EmptyButton)`
  text-decoration: underline;

  &:hover,
  &:focus {
    text-decoration: none;
  }
`
export const ExpandedRowItem = styled.div<React.HTMLAttributes<HTMLDivElement>>`
  display: flex;
  height: 42px;
  padding-left: ${({ theme }) => theme.core.space.space150};

  & > div {
    display: flex;
    align-items: center;
    flex: 1;
  }
`
export const TruncatedContent = styled(Row)`
  ${truncateText}
  padding-left: ${({ theme }) => theme.core.space.space150};
`
