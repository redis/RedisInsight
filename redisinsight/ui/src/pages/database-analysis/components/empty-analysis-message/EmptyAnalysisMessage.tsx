import React from 'react'
import { useParams } from 'react-router-dom'

import { Pages } from 'uiSrc/constants'
import { EmptyMessage, Content } from 'uiSrc/pages/database-analysis/constants'
import { getRouterLinkProps } from 'uiSrc/services'

import * as S from './EmptyAnalysisMessage.styles'

interface Props {
  name: EmptyMessage
}

const emptyMessageContent: { [key in EmptyMessage]: Content } = {
  [EmptyMessage.Reports]: {
    title: 'No Reports found',
    text: () => 'Click "Analyze" to generate the first report.',
  },
  [EmptyMessage.Keys]: {
    title: 'No keys to display',
    text: (path) => (
      <>
        <S.SummaryLink
          {...getRouterLinkProps(path)}
          data-test-subj="workbench-page-btn"
        >
          Use Workbench Guides and Tutorials
        </S.SummaryLink>
        {' to quickly load the data.'}
      </>
    ),
  },
  [EmptyMessage.Encrypt]: {
    title: 'Encrypted data',
    text: () =>
      'Unable to decrypt. Check the system keychain or re-run the report generation.',
  },
}

const EmptyAnalysisMessage = (props: Props) => {
  const { name } = props

  const { instanceId = '' } = useParams<{ instanceId: string }>()

  const { text, title } = emptyMessageContent[name]

  return (
    <S.Container data-testid={`empty-analysis-no-${name}`}>
      <S.Content>
        <S.Title>{title}</S.Title>
        <S.Summary>{text(Pages.workbench(instanceId))}</S.Summary>
      </S.Content>
    </S.Container>
  )
}

export default EmptyAnalysisMessage
