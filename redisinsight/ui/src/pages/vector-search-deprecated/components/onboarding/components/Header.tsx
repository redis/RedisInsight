import React from 'react'

import { Text, Title } from 'uiSrc/components/base/text'
import { HeaderContainer } from '../VectorSearchOnboarding.styles'

const Header: React.FC = () => (
  <HeaderContainer
    direction="column"
    justify="center"
    align="center"
    grow={false}
    data-testid="vector-search-onboarding--header"
  >
    <Title size="XL">Get started with vector search</Title>
    <Text size="M">
      Launch a quick onboarding to learn how to build ultra-fast similarity
      search across massive datasets - in real time.
    </Text>
  </HeaderContainer>
)

export default Header
