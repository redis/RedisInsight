import React from 'react'
import { useHistory } from 'react-router-dom'

import EmptyPipelineIcon from 'uiSrc/assets/img/rdi/empty_pipeline.svg'
import { Pages } from 'uiSrc/constants'
import { Text } from 'uiSrc/components/base/text'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { RiImage } from 'uiSrc/components/base/display'
import Panel from '../components/panel'

import * as S from './Empty.styles'

interface Props {
  rdiInstanceId: string
}

const Empty = ({ rdiInstanceId }: Props) => {
  const history = useHistory()

  return (
    <Panel>
      <S.EmptyPipelineContainer data-testid="empty-pipeline">
        <RiImage src={EmptyPipelineIcon} alt="empty" $size="s" />
        <Spacer size="xl" />
        <Text>No pipeline deployed yet</Text>
        <S.SubTitle>Create your first pipeline to get started!</S.SubTitle>
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
      </S.EmptyPipelineContainer>
    </Panel>
  )
}

export default Empty
