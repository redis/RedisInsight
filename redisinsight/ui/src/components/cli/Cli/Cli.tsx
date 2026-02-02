import React from 'react'

import CliHeader from 'uiSrc/components/cli/components/cli-header'
import CliBodyWrapper from 'uiSrc/components/cli/components/cli-body'
import * as S from '../Cli.styles'

const CLI = () => (
  <S.CliContainer data-testid="cli">
    <S.CliMain>
      <CliHeader />
      <CliBodyWrapper />
    </S.CliMain>
  </S.CliContainer>
)

export default CLI
