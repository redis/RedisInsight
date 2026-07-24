import React from 'react'
import { useHistory } from 'react-router-dom'
import { useAppSelector } from 'uiSrc/slices/hooks'

import { Text } from 'uiSrc/components/base/text'
import { Pages } from 'uiSrc/constants'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { Title } from 'uiSrc/components/base/text/Title'
import { Trans, useTranslation } from 'uiSrc/i18n'

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
  const { t } = useTranslation()
  const history = useHistory()
  const { id: connectedInstanceId = '' } = useAppSelector(
    connectedInstanceSelector,
  )

  const handleGoWorkbenchPage = (e: React.MouseEvent) => {
    e.preventDefault()
    history.push(Pages.workbench(connectedInstanceId))
  }

  return (
    <TextDetailsWrapper onClose={onClose} testid="modules-type">
      <Title size="M">
        {t('browser.keyDetails.modulesType.title', { moduleName })}
      </Title>
      <Text size="S">
        <Trans
          i18nKey="browser.keyDetails.modulesType.message"
          components={{
            workbenchLink: (
              <a
                tabIndex={0}
                onClick={handleGoWorkbenchPage}
                className={styles.link}
                data-testid="internal-workbench-link"
                onKeyDown={() => ({})}
                role="link"
                rel="noreferrer"
              >
                {''}
              </a>
            ),
          }}
        />
      </Text>
    </TextDetailsWrapper>
  )
}

export default ModulesTypeDetails
