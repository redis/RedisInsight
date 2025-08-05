import React from 'react'
import { useParams } from 'react-router-dom'
import { RiText } from 'uiSrc/components/base/text'

import { Pages } from 'uiSrc/constants'
import { EmptyMessage, Content } from 'uiSrc/pages/database-analysis/constants'
import { getRouterLinkProps } from 'uiSrc/services'

import { RiLink } from 'uiSrc/components/base/display'
import styles from './styles.module.scss'

interface Props {
  name: EmptyMessage
}

const emptyMessageContent: { [key in EmptyMessage]: Content } = {
  [EmptyMessage.Reports]: {
    title: 'No Reports found',
    text: () => 'Run "New Analysis" to generate first report.',
  },
  [EmptyMessage.Keys]: {
    title: 'No keys to display',
    text: (path) => (
      <>
        <RiLink
          {...getRouterLinkProps(path)}
          className={styles.summary}
          data-test-subj="workbench-page-btn"
        >
          Use Workbench Guides and Tutorials
        </RiLink>
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
    <div className={styles.container} data-testid={`empty-analysis-no-${name}`}>
      <div className={styles.content}>
        <RiText className={styles.title}>{title}</RiText>
        <RiText className={styles.summary}>
          {text(Pages.workbench(instanceId))}
        </RiText>
      </div>
    </div>
  )
}

export default EmptyAnalysisMessage
