import React from 'react'
import styled from 'styled-components'
import { Text, Title } from 'uiSrc/components/base/text'

export const StyledBoxContent = styled.div`
  padding: ${({ theme }) => theme.core.space.space200};
  text-align: left;
`

export const StyledTitle = styled(Title)`
  margin-top: ${({ theme }) => theme.core.space.space050};
`

export const StyledText = styled(Text)`
  margin-top: ${({ theme }) => theme.core.space.space050};
  white-space: normal;
  overflow-wrap: break-word;
`

export const StyledDisabledBar = styled.div`
  padding: ${({ theme }) => theme.core.space.space025} 0;
  background: ${({ theme }) => theme.color.dusk100};
  color: ${({ theme }) => theme.color.dusk400};
  /* Theme adjustments TODO: add radii scale */
  border-radius: ${({ theme }) => theme.core.space.space025};
  /* Theme adjustments TODO: border width scale */
  border-bottom: 1px solid ${({ theme }) => theme.color.gray500};
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
`

export const DisabledBar = () => (
  <StyledDisabledBar>
    <Text size="xs">Coming soon</Text>
  </StyledDisabledBar>
)
