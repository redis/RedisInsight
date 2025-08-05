import React from 'react'
import { useHistory } from 'react-router-dom'

import EmptyPipelineIcon from 'uiSrc/assets/img/rdi/empty_pipeline.svg'
import { Pages } from 'uiSrc/constants'
import { RiText } from 'uiSrc/components/base/text'
import { RiSpacer } from 'uiSrc/components/base/layout/spacer'
import { RiPrimaryButton } from 'uiSrc/components/base/forms'
import { RiImage } from 'uiSrc/components/base/display'
import Panel from '../components/panel'

import styles from './styles.module.scss'

interface Props {
  rdiInstanceId: string
}

const Empty = ({ rdiInstanceId }: Props) => {
  const history = useHistory()

  return (
    <Panel>
      <div
        className={styles.emptyPipelineContainer}
        data-testid="empty-pipeline"
      >
        <RiImage src={EmptyPipelineIcon} alt="empty" $size="s" />
        <RiSpacer size="xl" />
        <RiText>No pipeline deployed yet</RiText>
        <RiText className={styles.subTitle}>
          Create your first pipeline to get started!
        </RiText>
        <RiSpacer size="l" />
        <RiPrimaryButton
          data-testid="add-pipeline-btn"
          size="s"
          onClick={() => {
            history.push(Pages.rdiPipelineConfig(rdiInstanceId))
          }}
        >
          Add Pipeline
        </RiPrimaryButton>
      </div>
    </Panel>
  )
}

export default Empty
