import React from 'react'
import { useHistory } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { Text } from 'uiSrc/components/base/text'
import { Pages } from 'uiSrc/constants'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { Title } from 'uiSrc/components/base/text/Title'

import * as S from './ModulesTypeDetails.styles'
import TextDetailsWrapper from '../text-details-wrapper/TextDetailsWrapper'

type ModulesTypeDetailsProps = {
  moduleName: string
  onClose: () => void
}
const ModulesTypeDetails = ({
  moduleName = 'unsupported',
  onClose,
}: ModulesTypeDetailsProps) => {
  const history = useHistory()
  const { id: connectedInstanceId = '' } = useSelector(
    connectedInstanceSelector,
  )

  const handleGoWorkbenchPage = (e: React.MouseEvent) => {
    e.preventDefault()
    history.push(Pages.workbench(connectedInstanceId))
  }

  return (
    <TextDetailsWrapper onClose={onClose} testid="modules-type">
      <Title size="M">{`This is a ${moduleName} key.`}</Title>
      <Text size="S">
        {'Use Redis commands in the '}
        <S.Link
          tabIndex={0}
          onClick={handleGoWorkbenchPage}
          data-testid="internal-workbench-link"
          onKeyDown={() => ({})}
          role="link"
          rel="noreferrer"
        >
          Workbench
        </S.Link>
        {' tool to view the value.'}
      </Text>
    </TextDetailsWrapper>
  )
}

export default ModulesTypeDetails
