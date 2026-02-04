import React, { useState } from 'react'

import { useDispatch } from 'react-redux'

import cx from 'classnames'
import { PlusIcon } from 'uiSrc/components/base/icons'
import {
  appendReJSONArrayItemAction,
  fetchVisualisationResults,
  removeReJSONKeyAction,
  setReJSONDataAction,
} from 'uiSrc/slices/browser/rejson'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'

import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { getBrackets, isRealArray, isRealObject, wrapPath } from '../utils'
import { BaseProps, ObjectTypes } from '../interfaces'
import RejsonDynamicTypes from '../rejson-dynamic-types'
import { AddItem } from '../components'
import ChangeEditorTypeButton from '../../change-editor-type-button'

import * as S from '../Rejson.styles'

const RejsonDetails = (props: BaseProps) => {
  const {
    data,
    selectedKey,
    length,
    dataType,
    parentPath,
    isDownloaded,
    onJsonKeyExpandAndCollapse,
    expandedRows,
  } = props

  const [addRootKVPair, setAddRootKVPair] = useState<boolean>(false)

  const dispatch = useDispatch()

  const handleFetchVisualisationResults = (
    path: string,
    forceRetrieve = false,
  ) => dispatch<any>(fetchVisualisationResults(path, forceRetrieve))

  const handleAppendRejsonArrayItemAction = (
    keyName: RedisResponseBuffer,
    path: string,
    data: string,
  ) => {
    dispatch(appendReJSONArrayItemAction(keyName, path, data, length))
  }

  const handleSetRejsonDataAction = (
    keyName: RedisResponseBuffer,
    path: string,
    data: string,
  ) => {
    dispatch(setReJSONDataAction(keyName, path, data, false, length))
  }

  const handleFormSubmit = ({
    key,
    value,
  }: {
    key?: string
    value: string
  }) => {
    setAddRootKVPair(false)
    if (isRealArray(data, dataType)) {
      handleAppendRejsonArrayItemAction(selectedKey, '$', value)
      return
    }

    const updatedPath = wrapPath(key as string)
    if (updatedPath) {
      handleSetRejsonDataAction(selectedKey, updatedPath, value)
    }
  }

  const onClickRemoveKey = (path: string, keyName: string) => {
    dispatch(removeReJSONKeyAction(selectedKey, path || '$', keyName, length))
  }

  const onClickSetRootKVPair = () => {
    setAddRootKVPair(!addRootKVPair)
  }

  const isObject = isRealObject(data, dataType)
  const isArray = isRealArray(data, dataType)

  return (
    <S.JsonData id="jsonData" data-testid="json-data">
      <>
        {(isObject || isArray) && (
          <S.TopRow>
            <span>
              {getBrackets(
                isObject ? ObjectTypes.Object : ObjectTypes.Array,
                'start',
              )}
            </span>
            <ChangeEditorTypeButton />
          </S.TopRow>
        )}
        <RejsonDynamicTypes
          data={data}
          parentPath={parentPath}
          selectedKey={selectedKey}
          isDownloaded={isDownloaded}
          expandedRows={expandedRows}
          onClickRemoveKey={onClickRemoveKey}
          onJsonKeyExpandAndCollapse={onJsonKeyExpandAndCollapse}
          handleAppendRejsonObjectItemAction={handleAppendRejsonArrayItemAction}
          handleSetRejsonDataAction={handleSetRejsonDataAction}
          handleFetchVisualisationResults={handleFetchVisualisationResults}
        />
        {addRootKVPair && (
          <AddItem
            isPair={isObject}
            onCancel={() => setAddRootKVPair(false)}
            onSubmit={handleFormSubmit}
            parentPath={parentPath || '$'}
          />
        )}
        {(isObject || isArray) && (
          <S.Row>
            <span>
              {getBrackets(
                isObject ? ObjectTypes.Object : ObjectTypes.Array,
                'end',
              )}
            </span>
            {!addRootKVPair && (
              <IconButton
                icon={PlusIcon}
                size="S"
                className={S.actionButtonsClassName}
                onClick={onClickSetRootKVPair}
                aria-label="Add field"
                data-testid={isObject ? 'add-object-btn' : 'add-array-btn'}
              />
            )}
          </S.Row>
        )}
      </>
    </S.JsonData>
  )
}

export default RejsonDetails
