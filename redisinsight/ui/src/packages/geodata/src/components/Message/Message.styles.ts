import styled from 'styled-components'

import { Banner } from 'uiSrc/components/base/display/banner'

export const StyledBanner = styled(Banner.Compose)`
  width: 100%;
  margin-top: ${({ theme }) => theme.core.space.space150};
`
