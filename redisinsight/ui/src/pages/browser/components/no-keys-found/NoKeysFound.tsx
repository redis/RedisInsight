import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import NoDataImg from 'uiSrc/assets/img/no-data.svg'

import { findTutorialPath } from 'uiSrc/utils'
import {
  openTutorialByPath,
  sidePanelsSelector,
} from 'uiSrc/slices/panels/sidePanels'
import { SidePanels } from 'uiSrc/slices/interfaces/insights'
import { KeyViewType, SearchMode } from 'uiSrc/slices/interfaces/keys'
import {
  changeKeyViewType,
  fetchKeys,
  keysSelector,
} from 'uiSrc/slices/browser/keys'
import { SCAN_TREE_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { TutorialsIds } from 'uiSrc/constants'

import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { Title } from 'uiSrc/components/base/text/Title'
import { RiImage } from 'uiSrc/components/base/display'
import { Row } from 'uiSrc/components/base/layout/flex'
import LoadSampleData from '../load-sample-data'

import styles from './styles.module.scss'
import {Button, TextButton} from '@redis-ui/components'
import {PlusSlimIcon} from '@redis-ui/icons'

export interface Props {
  onAddKeyPanel: (value: boolean) => void
}

const NoKeysFound = (props: Props) => {
  const { onAddKeyPanel } = props
  const { openedPanel } = useSelector(sidePanelsSelector)
  const { viewType } = useSelector(keysSelector)

  const dispatch = useDispatch()
  const history = useHistory()

  const onSuccessLoadData = () => {
    if (openedPanel !== SidePanels.AiAssistant) {
      const tutorialPath = findTutorialPath({ id: TutorialsIds.RedisUseCases })
      dispatch(openTutorialByPath(tutorialPath, history, true))
    }

    if (viewType === KeyViewType.Browser) {
      dispatch(changeKeyViewType(KeyViewType.Tree))
    }

    dispatch(
      fetchKeys({
        searchMode: SearchMode.Pattern,
        cursor: '0',
        count: SCAN_TREE_COUNT_DEFAULT,
      }),
    )

    onAddKeyPanel(false)
  }

  return (
    <div className={styles.container} data-testid="no-result-found-msg">
      <RiImage className={styles.img} src={NoDataImg} alt="no results" />
      <Spacer />
      <Title color="primary" className={styles.title} size="S">
        Let&apos;s start working
      </Title>
      <Spacer />
      <Row gap="l">
        <LoadSampleData onSuccess={onSuccessLoadData} />
        <TextButton
          onClick={() => onAddKeyPanel(true)}
          className={styles.addKey}
          data-testid="add-key-msg-btn"
          variant="primary-inline"
        >
          <Button.Icon icon={PlusSlimIcon} /> Add key manually
        </TextButton>
      </Row>
    </div>
  )
}

export default NoKeysFound
