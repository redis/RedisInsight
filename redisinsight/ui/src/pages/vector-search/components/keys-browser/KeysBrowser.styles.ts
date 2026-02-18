import styled from 'styled-components'
import Tabs from 'uiSrc/components/base/layout/tabs'
import { Col, FlexItem } from 'uiSrc/components/base/layout/flex'
import { KeysBrowser } from 'uiSrc/components/browser'
import { Theme } from 'uiSrc/components/base/theme/types'

export const Container = styled(Col)`
  height: 100%;
  overflow: hidden;
`

export const HeaderWrapper = styled(KeysBrowser.Header).attrs({
  align: 'center',
  justify: 'between',
})`
  padding: ${({ theme }) => theme.core?.space?.space200};
  border-bottom: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic?.color?.border.neutral500};
`

export const TabBar = styled(Tabs.TabBar.Compose)`
  padding: ${({ theme }) => theme.core?.space?.space200};
  padding-bottom: 0;
`

export const InfoIconWrapper = styled(FlexItem).attrs({ grow: false })`
  margin-left: auto;
  align-items: center;
`

export const TreeWrapper = styled(Col)`
  overflow: hidden;
`

export const ErrorWrapper = styled(Col).attrs({
  contentCentered: true,
})`
  overflow: auto;
  padding: ${({ theme }) => theme.core?.space?.space200};
`
