import React, { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AutoSizer from 'react-virtualized-auto-sizer'

import {
  selectedKeyDataSelector,
  selectedKeySelector,
} from 'uiSrc/slices/browser/keys'
import { arrayDataSelector, addArrayElements } from 'uiSrc/slices/browser/array'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { KeyDetailsHeaderFormatter } from 'uiSrc/pages/browser/modules/key-details-header/components/key-details-header-formatter'
import { AddItemsAction } from 'uiSrc/pages/browser/modules/key-details/components/key-details-actions'
import {
  KeyDetailsHeader,
  KeyDetailsHeaderProps,
} from 'uiSrc/pages/browser/modules'
import { MIDDLE_SCREEN_RESOLUTION } from 'uiSrc/constants'

import { ArrayElementList } from './array-element-list/ArrayElementList'
import { AddKeyArray } from './array-add-element-form/ArrayAddElementForm'
import { AddKeysContainer } from '../common/AddKeysContainer.styled'
import * as S from './ArrayDetails.styles'

export interface Props extends KeyDetailsHeaderProps {
  onRemoveKey: () => void
  onOpenAddItemPanel: () => void
  onCloseAddItemPanel: () => void
}

const ArrayDetails = (props: Props) => {
  const { onRemoveKey, onOpenAddItemPanel, onCloseAddItemPanel } = props

  const dispatch = useDispatch()
  const selectedKeyData = useSelector(selectedKeyDataSelector)
  const { loading } = useSelector(selectedKeySelector)
  const { total = 0, logicalLength = 0 } = useSelector(arrayDataSelector) ?? {}
  const { nextInsertIndex } = selectedKeyData ?? {}

  const [isAddItemPanelOpen, setIsAddItemPanelOpen] = useState(false)

  const openAddItemPanel = useCallback(() => {
    setIsAddItemPanelOpen(true)
    onOpenAddItemPanel()
  }, [onOpenAddItemPanel])

  const closeAddItemPanel = useCallback(() => {
    setIsAddItemPanelOpen(false)
    onCloseAddItemPanel()
  }, [onCloseAddItemPanel])

  const handleAddElements = useCallback(
    (
      elements: { index: number; value: string }[],
      onSuccess?: () => void,
      onFail?: () => void,
    ) => {
      dispatch(
        addArrayElements(
          {
            keyName: selectedKeyData?.name as RedisResponseBuffer,
            elements,
          },
          () => {
            onSuccess?.()
            closeAddItemPanel()
          },
          onFail,
        ),
      )
    },
    [dispatch, selectedKeyData?.name, closeAddItemPanel],
  )

  return (
    <S.Container>
      <KeyDetailsHeader {...props} key="key-details-header" />

      {/* Subheader: element count summary + Add Elements button */}
      <AutoSizer disableHeight>
        {({ width = 0 }) => (
          <FlexItem style={{ width, padding: '8px 18px' }}>
            <Row justify="between" align="center">
              <FlexItem grow={false}>
                <Text
                  size="s"
                  color="primary"
                  data-testid="array-count-summary"
                >
                  {width > MIDDLE_SCREEN_RESOLUTION
                    ? `Count: ${total} · Length: ${logicalLength}${nextInsertIndex !== undefined ? ` · Next Insert Index: ${nextInsertIndex}` : ''}`
                    : `${total} / ${logicalLength}${nextInsertIndex !== undefined ? ` · NII: ${nextInsertIndex}` : ''}`}
                </Text>
              </FlexItem>
              <Row align="center" grow={false}>
                <KeyDetailsHeaderFormatter width={width} />
                <AddItemsAction
                  title="Add Elements"
                  width={width}
                  openAddItemPanel={openAddItemPanel}
                />
              </Row>
            </Row>
          </FlexItem>
        )}
      </AutoSizer>

      <S.DetailsBody>
        {!loading && (
          <S.ListWrapper>
            <ArrayElementList onRemoveKey={onRemoveKey} />
          </S.ListWrapper>
        )}
        {isAddItemPanelOpen && (
          <AddKeysContainer>
            <AddKeyArray
              onSubmit={handleAddElements}
              onCancel={closeAddItemPanel}
            />
          </AddKeysContainer>
        )}
      </S.DetailsBody>
    </S.Container>
  )
}

export { ArrayDetails }
