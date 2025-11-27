import styled from 'styled-components'
import { Row } from 'uiSrc/components/base/layout/flex'
import { Theme } from 'uiSrc/components/base/theme/types'

const getBorderColor = (theme: Theme) =>
  theme.name === 'dark' ? theme.color.dark600 : theme.color.dusk150

export const HeaderContainer = styled.div`
  width: 100%;
  border-bottom: 4px solid
    ${({ theme }: { theme: Theme }) => getBorderColor(theme)}; /* Mimic the tabs border width and color */
`

export const HeaderContent = styled(Row).attrs({
  align: 'center',
  justify: 'between',
})`
  min-height: 36px;
`

export const TabsWrapper = styled.div`
  margin-bottom: -14px; /* Move it so it overlaps with the border of the tabs container */
`
