import styled from 'styled-components'
import { Page } from 'uiSrc/components/base/layout/page'

export const StyledPage = styled(Page)`
  padding: 0 16px 16px;

  .homePage {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }

  .databaseContainer {
    flex-grow: 1;
  }

  .databaseList {
    flex-grow: 1;
    height: auto;
  }

  .footerAddDatabase {
    flex-shrink: 0;
  }
`

export const ExplorePanel = styled.div`
  padding-bottom: 16px;
`
