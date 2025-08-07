import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import TelescopeImg from 'uiSrc/assets/img/telescope-dark.svg'

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
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import { Title } from 'uiSrc/components/base/text/Title'
import { RiImage } from 'uiSrc/components/base/display'
import LoadSampleData from '../load-sample-data'

import styles from './styles.module.scss'

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
      <RiImage
        className={styles.img}
        src={TelescopeImg}
        alt="no results"
      />
      <Spacer />
      <Title className={styles.title} size="S">
        Let&apos;s start working
      </Title>
      <Spacer />
      <div className={styles.actions}>
        <LoadSampleData onSuccess={onSuccessLoadData} />
        <EmptyButton
          onClick={() => onAddKeyPanel(true)}
          className={styles.addKey}
          data-testid="add-key-msg-btn"
        >
          + Add key manually
        </EmptyButton>
      </div>
    </div>
  )
}

export default NoKeysFound
