import React from 'react'
import { useHistory } from 'react-router-dom'

import EmptyPipelineIcon from 'uiSrc/assets/img/rdi/empty_pipeline.svg'
import { Pages } from 'uiSrc/constants'
import { useTranslation } from 'uiSrc/i18n'
import { Text } from 'uiSrc/components/base/text'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { RiImage } from 'uiSrc/components/base/display'
import Panel from '../components/panel'

import styles from './styles.module.scss'

interface Props {
  rdiInstanceId: string
}

const Empty = ({ rdiInstanceId }: Props) => {
  const history = useHistory()
  const { t } = useTranslation()

  return (
    <Panel>
      <div
        className={styles.emptyPipelineContainer}
        data-testid="empty-pipeline"
      >
        <RiImage src={EmptyPipelineIcon} alt="empty" $size="s" />
        <Spacer size="xl" />
        <Text>{t('rdi.statistics.empty.title')}</Text>
        <Text className={styles.subTitle}>
          {t('rdi.statistics.empty.description')}
        </Text>
        <Spacer size="l" />
        <PrimaryButton
          data-testid="add-pipeline-btn"
          size="s"
          onClick={() => {
            history.push(Pages.rdiPipelineConfig(rdiInstanceId))
          }}
        >
          {t('rdi.statistics.empty.addButton')}
        </PrimaryButton>
      </div>
    </Panel>
  )
}

export default Empty
