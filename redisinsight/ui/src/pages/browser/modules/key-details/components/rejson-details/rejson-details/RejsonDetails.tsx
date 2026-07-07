import React, { useState } from 'react'

import { useAppDispatch } from 'uiSrc/slices/hooks'

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
import {
  getBrackets,
  isRealArray,
  isRealObject,
  isScalar,
  wrapPath,
} from '../utils'
import { BaseProps, ObjectTypes } from '../interfaces'
import RejsonDynamicTypes from '../rejson-dynamic-types'
import { AddItem, JsonValueActions } from '../components'
import ChangeEditorTypeButton from '../../change-editor-type-button'

import styles from '../styles.module.scss'
import { TopRowActions } from './RejsonDetails.styles'

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

  const dispatch = useAppDispatch()

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
  // Scalar roots (e.g. a bare null/string/number/boolean document) have no
  // inline edit affordance, so expose the text editor as the way to edit them.
  const isScalarRoot = !isObject && !isArray && isScalar(data)

  return (
    <div className={styles.jsonData} id="jsonData" data-testid="json-data">
      <>
        <div className={cx(styles.row, styles.topRow)}>
          <span>
            {(isObject || isArray) &&
              getBrackets(
                isObject ? ObjectTypes.Object : ObjectTypes.Array,
                'start',
              )}
          </span>
          <TopRowActions align="center" justify="end" grow={false}>
            {(isObject || isArray || isScalarRoot) && (
              <ChangeEditorTypeButton />
            )}
            <JsonValueActions
              data={data}
              selectedKey={selectedKey}
              isDownloaded={isDownloaded}
            />
          </TopRowActions>
        </div>
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
          <div className={styles.row}>
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
                className={styles.buttonStyle}
                onClick={onClickSetRootKVPair}
                aria-label="Add field"
                data-testid={isObject ? 'add-object-btn' : 'add-array-btn'}
              />
            )}
          </div>
        )}
      </>
    </div>
  )
}

export default RejsonDetails
