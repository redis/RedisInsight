import styled from 'styled-components'
import { Row } from 'uiSrc/components/base/layout/flex'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const Container = styled(Row)`
  padding: 16px;
`

export const BreadcrumbsContainer = styled.div`
  height: 100%;
  display: flex;
  align-items: center;

  & > div {
    display: flex;
  }
`

export const RdiName = styled.span`
  display: inline-block;
  overflow: hidden;
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
  text-overflow: ellipsis;
  max-width: 100%;
  white-space: nowrap;
`

export const Divider = styled.span`
  color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.text.neutral600};
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
  margin: 0 8px;
`
