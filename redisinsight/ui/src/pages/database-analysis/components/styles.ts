import React from 'react'
import styled, { css } from 'styled-components'
import { Theme } from 'uiSrc/components/base/theme/types'
import { SwitchInput } from 'uiSrc/components/base/inputs'
import { Title } from 'uiSrc/components/base/text'
import { Col, Row } from 'uiSrc/components/base/layout/flex'

export const Section = styled.div<React.HTMLAttributes<HTMLDivElement>>`
  border-radius: ${({ theme }: { theme: Theme }) => theme.core.space.space200};
  margin-top: ${({ theme }: { theme: Theme }) => theme.core.space.space250};
  overflow: hidden;
  padding: ${({ theme }: { theme: Theme }) =>
    `${theme.core.space.space300} ${theme.core.space.space500}`};

  @media screen and (max-width: 920px) {
    padding: ${({ theme }: { theme: Theme }) =>
      `${theme.core.space.space200} ${theme.core.space.space250}`};
  }
`

export const sectionContent = css`
  max-width: 1720px;
  margin: 0 auto;
`

export const SectionTitleWrapper = styled(Row).attrs({ align: 'center' })`
  margin-bottom: ${({ theme }: { theme: Theme }) => theme.core.space.space250};
`

export const SwitchExtrapolateResults = styled(SwitchInput)`
  margin-left: ${({ theme }: { theme: Theme }) => theme.core.space.space300};
`

export const SectionTitle = styled(Title)`
  display: inline-block;
`

// Styled component for the main container with theme border
export const MainContainer = styled(Col)<React.HTMLAttributes<HTMLDivElement>>`
  height: 100%;
  overflow: auto;
  padding-inline: ${({ theme }: { theme: Theme }) => theme.core.space.space200};
`
