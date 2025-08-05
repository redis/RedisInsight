import React, { useEffect, useState } from 'react'
import cx from 'classnames'

import { useDispatch } from 'react-redux'
import { AxiosError } from 'axios'
import { isTruncatedString } from 'uiSrc/utils'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { AXIOS_ERROR_DISABLED_ACTION_WITH_TRUNCATED_DATA } from 'uiSrc/constants'
import { RiLoader } from 'uiSrc/components/base/display'
import RejsonDynamicTypes from '../rejson-dynamic-types'
import { JSONObjectProps, ObjectTypes, REJSONResponse } from '../interfaces'
import { generatePath, getBrackets, wrapPath } from '../utils'

import {
  AddItem,
  AddItemFieldAction,
  EditEntireItemAction,
  EditItemFieldAction,
} from '../components'

import styles from '../styles.module.scss'

const defaultValue: [] = []

const RejsonObject = (props: JSONObjectProps) => {
  const {
    type,
    parentPath,
    keyName,
    isDownloaded,
    expandedRows,
    leftPadding,
    selectedKey,
    cardinality = 0,
    handleSubmitRemoveKey,
    onClickRemoveKey,
    handleSubmitUpdateValue,
    onJsonKeyExpandAndCollapse,
    handleFetchVisualisationResults,
    handleAppendRejsonObjectItemAction,
    handleSetRejsonDataAction,
    path: currentFullPath,
    value: currentValue,
  } = props

  const [path] = useState<string>(
    currentFullPath || generatePath(parentPath, keyName),
  )
  const [value, setValue] = useState<any>(defaultValue)
  const [downloaded, setDownloaded] = useState<boolean>(isDownloaded)
  const [editEntireObject, setEditEntireObject] = useState<boolean>(false)
  const [valueOfEntireObject, setValueOfEntireObject] = useState<any>('')
  const [addNewKeyValuePair, setAddNewKeyValuePair] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [isExpanded, setIsExpanded] = useState<boolean>(false)

  const dispatch = useDispatch()

  useEffect(() => {
    if (!expandedRows?.has(path)) {
      setValue(defaultValue)
      return
    }

    if (isDownloaded) {
      setValue(currentValue)
      setIsExpanded(expandedRows?.has(path))
      return
    }

    fetchObject()
  }, [])

  const handleFormSubmit = ({
    key,
    value,
  }: {
    key?: string
    value: string
  }) => {
    setAddNewKeyValuePair(false)

    if (type === ObjectTypes.Array) {
      handleAppendRejsonObjectItemAction(selectedKey, path, value)
      return
    }

    const updatedPath = wrapPath(key as string, path)
    if (updatedPath) {
      handleSetRejsonDataAction(selectedKey, updatedPath, value)
    }
  }

  const handleUpdateValueFormSubmit = (value: string) => {
    setEditEntireObject(false)
    handleSetRejsonDataAction(selectedKey, path, value as string)
  }

  const onClickEditEntireObject = () => {
    handleFetchVisualisationResults(path, true).then((data: REJSONResponse) => {
      if (isTruncatedString(data?.data)) {
        return dispatch(
          addErrorNotification(
            AXIOS_ERROR_DISABLED_ACTION_WITH_TRUNCATED_DATA as AxiosError,
          ),
        )
      }

      setEditEntireObject(true)
      setValueOfEntireObject(
        typeof data.data === 'object'
          ? JSON.stringify(
              data.data,
              (_key, value) =>
                typeof value === 'bigint' ? value.toString() : value,
              4,
            )
          : data.data,
      )
    })
  }

  const onClickExpandCollapse = (path: string) => {
    if (isExpanded) {
      onJsonKeyExpandAndCollapse(false, path)
      setIsExpanded(false)
      setValue(defaultValue)

      return
    }

    if (isDownloaded) {
      onJsonKeyExpandAndCollapse(true, path)
      setIsExpanded(true)
      setValue(currentValue)

      return
    }

    fetchObject()
  }

  const fetchObject = async () => {
    const spinnerDelay = setTimeout(() => setLoading(true), 300)

    try {
      const { data, downloaded } = await handleFetchVisualisationResults(path)
      setValue(data)
      onJsonKeyExpandAndCollapse(true, path)
      setDownloaded(downloaded)
      clearTimeout(spinnerDelay)
      setLoading(false)
      setIsExpanded(true)
    } catch {
      clearTimeout(spinnerDelay)
      setIsExpanded(false)
    }
  }

  return (
    <>
      <div className={styles.row} key={keyName + parentPath}>
        <div className={styles.rowContainer}>
          <div
            className={styles.quotedKeyName}
            style={{ paddingLeft: `${leftPadding}em` }}
          >
            <span
              className={cx(styles.quoted, styles.keyName)}
              onClick={() => onClickExpandCollapse(path)}
              role="presentation"
            >
              {keyName}
            </span>
            <div style={{ paddingLeft: '0.2em', display: 'inline-block' }}>
              :
            </div>
            {!isExpanded && !editEntireObject && (
              <div
                className={styles.defaultFontExpandArray}
                onClick={() => onClickExpandCollapse(path)}
                data-testid="expand-object"
                role="presentation"
              >
                {getBrackets(type, 'start')}
                {cardinality ? '...' : ''}
                {getBrackets(type, 'end')}
              </div>
            )}
            {isExpanded && !editEntireObject && (
              <span className={styles.defaultFontOpenIndex}>
                {getBrackets(type, 'start')}
              </span>
            )}
          </div>
          {!editEntireObject && !loading && (
            <EditItemFieldAction
              keyName={keyName.toString()}
              selectedKey={selectedKey}
              path={path}
              handleSubmitRemoveKey={handleSubmitRemoveKey}
              onClickEditEntireItem={onClickEditEntireObject}
            />
          )}
          {loading && (
            <div
              className={styles.actionButtons}
              style={{ justifyContent: 'flex-end' }}
            >
              <div className={styles.spinner}>
                <RiLoader size="m" />
              </div>
            </div>
          )}
        </div>
      </div>
      {editEntireObject ? (
        <EditEntireItemAction
          initialValue={valueOfEntireObject}
          onCancel={() => setEditEntireObject(false)}
          onSubmit={handleUpdateValueFormSubmit}
        />
      ) : (
        <RejsonDynamicTypes
          expandedRows={expandedRows}
          leftPadding={leftPadding}
          data={value}
          parentPath={path}
          selectedKey={selectedKey}
          isDownloaded={downloaded}
          onClickRemoveKey={onClickRemoveKey}
          onJsonKeyExpandAndCollapse={onJsonKeyExpandAndCollapse}
          handleSubmitUpdateValue={handleSubmitUpdateValue}
          handleFetchVisualisationResults={handleFetchVisualisationResults}
          handleAppendRejsonObjectItemAction={
            handleAppendRejsonObjectItemAction
          }
          handleSetRejsonDataAction={handleSetRejsonDataAction}
        />
      )}
      {addNewKeyValuePair && (
        <AddItem
          isPair={type === ObjectTypes.Object}
          onCancel={() => setAddNewKeyValuePair(false)}
          onSubmit={handleFormSubmit}
          leftPadding={leftPadding}
          parentPath={path}
        />
      )}
      {isExpanded && !editEntireObject && (
        <AddItemFieldAction
          leftPadding={leftPadding}
          type={type}
          onClickSetKVPair={() => setAddNewKeyValuePair(true)}
        />
      )}
    </>
  )
}

export default React.memo(RejsonObject)
