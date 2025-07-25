import React from 'react'
import { useHistory } from 'react-router-dom'

import EmptyPipelineIcon from 'uiSrc/assets/img/rdi/empty_pipeline.svg'
import { Pages } from 'uiSrc/constants'
import { Text } from 'uiSrc/components/base/text'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import Panel from '../components/panel'

import styles from './styles.module.scss'

interface Props {
  rdiInstanceId: string
}

const Empty = ({ rdiInstanceId }: Props) => {
  const history = useHistory()

  return (
    <Panel>
      <div className={styles.emptyPipelineContainer} data-testid="empty-pipeline">
        <img src={EmptyPipelineIcon} alt="empty" size="s" />
        <Spacer size="xl" />
        <Text>No pipeline deployed yet</Text>
        <Text className={styles.subTitle}>
          Create your first pipeline to get started!
        </Text>
        <Spacer size="l" />
        <PrimaryButton
          data-testid="add-pipeline-btn"
          size="s"
          onClick={() => {
            history.push(Pages.rdiPipelineConfig(rdiInstanceId))
          }}
        >
          Add Pipeline
        </PrimaryButton>
      </div>
    </Panel>
  )
}

export default Empty
