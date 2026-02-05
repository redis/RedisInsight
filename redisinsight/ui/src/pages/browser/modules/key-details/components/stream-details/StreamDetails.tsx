import React, { useState } from 'react'
import { useSelector } from 'react-redux'

import { selectedKeySelector } from 'uiSrc/slices/browser/keys'
import {
  KeyTypes,
  STREAM_ADD_ACTION,
  STREAM_ADD_GROUP_VIEW_TYPES,
} from 'uiSrc/constants'

import {
  KeyDetailsHeader,
  KeyDetailsHeaderProps,
} from 'uiSrc/pages/browser/modules'
import { streamSelector } from 'uiSrc/slices/browser/stream'
import { StreamViewType } from 'uiSrc/slices/interfaces/stream'
import { StreamDetailsBody } from './stream-details-body'
import AddStreamEntries from './add-stream-entity'
import AddStreamGroup from './add-stream-group'
import * as S from './StreamDetails.styles'
import { StreamItemsAction } from '../key-details-actions'
import { KeyDetailsSubheader } from '../key-details-subheader/KeyDetailsSubheader'
import { AddKeysContainer } from '../common/AddKeysContainer.styled'

export interface Props extends KeyDetailsHeaderProps {
  onRemoveKey: () => void
  onOpenAddItemPanel: () => void
  onCloseAddItemPanel: () => void
}

const StreamDetails = (props: Props) => {
  const keyType = KeyTypes.Stream
  const { onOpenAddItemPanel, onCloseAddItemPanel } = props

  const { loading } = useSelector(selectedKeySelector)
  const { viewType: streamViewType } = useSelector(streamSelector)

  const [isAddItemPanelOpen, setIsAddItemPanelOpen] = useState<boolean>(false)

  const openAddItemPanel = () => {
    setIsAddItemPanelOpen(true)

    if (!STREAM_ADD_GROUP_VIEW_TYPES.includes(streamViewType)) {
      onOpenAddItemPanel()
    }
  }

  const closeAddItemPanel = (isCancelled?: boolean) => {
    setIsAddItemPanelOpen(false)
    if (
      isCancelled &&
      isAddItemPanelOpen &&
      !STREAM_ADD_GROUP_VIEW_TYPES.includes(streamViewType)
    ) {
      onCloseAddItemPanel()
    }
  }

  const Actions = ({ width }: { width: number }) => (
    <StreamItemsAction
      width={width}
      title={STREAM_ADD_ACTION[streamViewType].name}
      openAddItemPanel={openAddItemPanel}
    />
  )

  return (
    <S.Container grow>
      <KeyDetailsHeader {...props} key="key-details-header" />
      <KeyDetailsSubheader keyType={keyType} Actions={Actions} />
      <S.KeyDetailsBody key="key-details-body">
        {!loading && (
          <S.StreamDetailsWrapper>
            <StreamDetailsBody />
          </S.StreamDetailsWrapper>
        )}
        {isAddItemPanelOpen && (
          <AddKeysContainer>
            {streamViewType === StreamViewType.Data && (
              <AddStreamEntries closePanel={closeAddItemPanel} />
            )}
            {STREAM_ADD_GROUP_VIEW_TYPES.includes(streamViewType!) && (
              <AddStreamGroup closePanel={closeAddItemPanel} />
            )}
          </AddKeysContainer>
        )}
      </S.KeyDetailsBody>
    </S.Container>
  )
}

export { StreamDetails }
