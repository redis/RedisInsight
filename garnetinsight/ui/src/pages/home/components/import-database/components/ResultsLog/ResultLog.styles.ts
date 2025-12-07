import styled from 'styled-components'

import { Col } from 'uiSrc/components/base/layout/flex'

// Ideally this should not be needed, but the section component
// will not let the parent cut the border, more precisely the box-shadow,
// so we need to add padding to the parent container
export const StyledColWrapper = styled(Col)`
  padding: ${({ theme }) => theme.core.space.space025};
`
