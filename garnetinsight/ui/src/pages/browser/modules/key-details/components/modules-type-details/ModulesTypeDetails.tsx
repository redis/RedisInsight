import React from 'react'
import { useHistory } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { Text } from 'uiSrc/components/base/text'
import { Pages } from 'uiSrc/constants'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { Title } from 'uiSrc/components/base/text/Title'

import TextDetailsWrapper from '../text-details-wrapper/TextDetailsWrapper'
import styles from './styles.module.scss'

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
        <a
          tabIndex={0}
          onClick={handleGoWorkbenchPage}
          className={styles.link}
          data-testid="internal-workbench-link"
          onKeyDown={() => ({})}
          role="link"
          rel="noreferrer"
        >
          Workbench
        </a>
        {' tool to view the value.'}
      </Text>
    </TextDetailsWrapper>
  )
}

export default ModulesTypeDetails
