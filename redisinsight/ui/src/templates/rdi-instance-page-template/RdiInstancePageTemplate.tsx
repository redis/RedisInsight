import React from 'react'
import { ExplorePanelTemplate } from 'uiSrc/templates'
import { RdiInstancePageContentContainer } from 'uiSrc/templates/rdi-instance-page-template/styles'

export interface Props {
  children: React.ReactNode
}

const RdiInstancePageTemplate = (props: Props) => {
  const { children } = props

  return (
    <RdiInstancePageContentContainer>
      <ExplorePanelTemplate>{children}</ExplorePanelTemplate>
    </RdiInstancePageContentContainer>
  )
}

export default RdiInstancePageTemplate
