import styled from 'styled-components'
import { Row } from 'uiSrc/components/base/layout/flex'
import { ButtonGroup } from 'uiSrc/components/base/forms/button-group/ButtonGroup'

export const Content = styled.div`
  width: 100%;
  padding: 0 ${({ theme }) => theme.core.space.space200}
    ${({ theme }) => theme.core.space.space100}
    ${({ theme }) => theme.core.space.space200};
  display: flex;
  justify-content: space-between;
  position: relative;
`

export const SearchWrapper = styled(Row)`
  display: flex;
  flex-grow: 1;
`

export const SwitchSearchModeButtonGroup = styled(ButtonGroup)`
  button {
    height: 32px;
    svg {
      height: 20px;
      width: 20px;
    }
  }
`

// Class names for components that expect string className props
export const moduleNotLoadedClassName = 'module-not-loaded-modal'
export const browserFilterOnboardClassName = 'browser-filter-onboard'

export const ClassStyles = styled.div`
  .${moduleNotLoadedClassName} {
    max-width: 520px;
    z-index: 10000;
  }

  .${browserFilterOnboardClassName} {
    margin-left: -5px;
  }
`
