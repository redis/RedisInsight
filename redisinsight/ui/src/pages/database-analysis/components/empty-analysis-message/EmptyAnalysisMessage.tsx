import React from 'react'
import { useParams } from 'react-router-dom'
import { Text } from 'uiSrc/components/base/text'

import { Pages } from 'uiSrc/constants'
import { Trans, useTranslation } from 'uiSrc/i18n'
import { EmptyMessage, Content } from 'uiSrc/pages/database-analysis/constants'
import { getRouterLinkProps } from 'uiSrc/services'

import { Link } from 'uiSrc/components/base/link/Link'
import styles from './styles.module.scss'

interface Props {
  name: EmptyMessage
}

const EmptyAnalysisMessage = (props: Props) => {
  const { name } = props

  const { t } = useTranslation()
  const { instanceId = '' } = useParams<{ instanceId: string }>()

  const emptyMessageContent: { [key in EmptyMessage]: Content } = {
    [EmptyMessage.Reports]: {
      title: t('analytics.databaseAnalysis.empty.reports.title'),
      text: () => t('analytics.databaseAnalysis.empty.reports.text'),
    },
    [EmptyMessage.Keys]: {
      title: t('analytics.databaseAnalysis.empty.keys.title'),
      text: (path) => (
        <Trans
          i18nKey="analytics.databaseAnalysis.empty.keys.text"
          components={{
            workbenchLink: (
              <Link
                {...getRouterLinkProps(path)}
                className={styles.summary}
                data-test-subj="workbench-page-btn"
              />
            ),
          }}
        />
      ),
    },
    [EmptyMessage.Encrypt]: {
      title: t('analytics.databaseAnalysis.empty.encrypt.title'),
      text: () => t('analytics.databaseAnalysis.empty.encrypt.text'),
    },
  }

  const { text, title } = emptyMessageContent[name]

  return (
    <div className={styles.container} data-testid={`empty-analysis-no-${name}`}>
      <div className={styles.content}>
        <Text className={styles.title}>{title}</Text>
        <Text className={styles.summary}>
          {text(Pages.workbench(instanceId))}
        </Text>
      </div>
    </div>
  )
}

export default EmptyAnalysisMessage
