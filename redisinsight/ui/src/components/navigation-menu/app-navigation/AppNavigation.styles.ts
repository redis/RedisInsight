import styled from 'styled-components'
import { Row } from 'uiSrc/components/base/layout/flex'

export const StyledAppNavigation = styled(Row)`
  padding: ${({ theme }) => (
    console.log(theme.components.appBar), theme.components.appBar.padding
  )};
  background: ${({ theme }) =>
    theme.components.appBar.variants.default.bgColor};
  color: ${({ theme }) => theme.components.appBar.variants.default.color};
  height: ${({ theme }) => theme.components.appBar.height};
  z-index: ${({ theme }) => theme.core.zIndex.zIndex5};
  box-shadow: ${({ theme }) => theme.components.appBar.boxShadow};
  box-sizing: border-box;

  > div:last-child {
    margin-inline-start: auto;
  }
`

export const Separator = styled.div`
  margin: ${({ theme }) => theme.components.appBar.group.gap};
  height: 100%;
`

export const StyledAppNavigationContainer = styled(Row)`
  height: 100%;
  gap: ${({ theme }) => theme.components.appBar.group.gap};

  & > ${Separator} {
    margin: 0;
  }
`
/*
{
    "height": "7rem",
    "padding": "1.4rem 1.4rem 1.4rem 2.4rem",
    "separator": "1px solid #eaedf2",
    "boxShadow": "0px 1px 0px 0px #eaedf2",
    "group": {
        "gap": "1.6rem"
    },
    "variants": {
        "default": {
            "bgColor": "#ffffff",
            "color": "inherit"
        },
        "alert": {
            "bgColor": "#ff2d55",
            "color": "#ffffff"
        }
    }
}
 */
